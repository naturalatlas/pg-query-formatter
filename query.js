var pgescape = require('pg-escape');
var _        = require('lodash');

/**
 * Creates a query object from a format string and a list of values
 *
 * Format tags
 * 
 * %s - string
 * %I - Identifier
 * %L - Literal
 * %Q - Subquery
 *
 * Any value that is passed as an array will automatically get expanded. (joined by commas)
 * ex.
 *
 * var q = new Query('SELECT * FROM cities WHERE state IN (%L)', ['WY', 'MT']);
 *
 * Subqueries are also supported:
 *
 * var q1 = new Query(...);
 * var q2 = new Query(...);
 * var union = new Query('%Q UNION ALL %Q', q1, q2);
 *
 * @class
 * @param  {string}  fmt       
 * @param  {*}       values...
 */

var Query = module.exports = function(fmt, values){
	this.fmt = fmt;
	this.values = Array.prototype.slice.call(arguments, 1);
};

Query.prototype.append = function(fmt, values){
	var values = Array.prototype.slice.call(arguments, 1);

	this.fmt += fmt; 
	this.values = this.values.concat(values);
}

/**
 * Turns the query object into a parameterized query
 * ready for node-postgres
 *
 * @param  {boolean} [use_numbered_params=true] - '$i' or '?'
 * @param  {integer} [start_index=1]            - numbering index to start at
 * @return {object}                             - (text, values)
 */
Query.prototype.toParam = function(use_numbered_params, start_index){
	//handle arrays? 
	
	if (arguments.length == 0) {
		use_numbered_params = true;
		start_index = 1;
	} else if (arguments.length == 1){
		start_index = 1;
	}

	var self = this;
	var numbering_index = start_index;
	var i = 0;
	var values = [];

	var text = this.fmt.replace(/%([%sILQ])/g, function(match, type){
		if ('%' == type) return '%';

		var value = self.values[i++];
		if (value instanceof Array){
			switch (type) {
				case 's':
					return _.map(value, pgescape.string).join(', ');
				case 'I': 
					return _.map(value, pgescape.ident).join(', ');
				case 'L': 
					return _.map(value, function(value){
						values.push(value);
						return use_numbered_params ? '$'+(numbering_index++) : '?';
					}).join(', ');
				case 'Q': 
					return _.map(value, function(value){
						var subquery    =  value.toParam(use_numbered_params, numbering_index);
						values          =  values.concat(subquery.values);
						numbering_index += subquery.values.length;
						return subquery.text;
					}).join(', ');
			}
		} else {
			switch (type) {
				case 's':
					return pgescape.string(value);
				case 'I': 
					return pgescape.ident(value);
				case 'L': 
					values.push(value);
					return use_numbered_params ? '$'+(numbering_index++) : '?';
				case 'Q': 
					var subquery    =  value.toParam(use_numbered_params, numbering_index);
					values          =  values.concat(subquery.values);
					numbering_index += subquery.values.length;
					return subquery.text;
			}
		}
	});

	return {
		text: text,
		values: values,
	}
}

Query.prototype.toString = function(){
	var q = this.toParam(false);
	var i = 0;
	return q.text.replace(/\?/g, function(){
		var value = q.values[i++];
		var str = value.toString();
		if(typeof value === 'string'){
			str = pgescape.literal(str);
		}
		return str;
	});
	return text;
}

/**
 * A class for representing a list of query objects
 * that will be joined when toParam() is called
 *
 * ex.
 * var where = new Query.List(' AND ');
 * where.append('age > %L', 20);
 * where.append('age < %L', 30);
 * where.append('name IN (%L)', ['George', 'Jorge', 'Georgio']);
 *
 * var select = new Query('SELECT * FROM people WHERE %Q', where);
 *
 * @class
 * @param {string} [separator=', '] - string to use between each query when joined
 */
var List = Query.List = function(separator){
	this.separator = separator || ', ';
	this.values    = [];
	this.fmt       = '';
}

_.extend(List.prototype, Query.prototype)

List.prototype.append = function(fmt, values){
	var self = this;

	var values = Array.prototype.slice.call(arguments, 1);

	this.fmt   += this.fmt ? this.separator + fmt : fmt;
	this.values = this.values.concat(values);
}

var AssignmentList = Query.AssignmentList = function(obj){
	List.call(this, ', ');
	if(obj) this.append(obj);
}

_.extend(AssignmentList.prototype, List.prototype);

AssignmentList.prototype.append = function(obj) {
	var self = this;
	_.each(obj, function(value, key){
		List.prototype.append.call(self, '%I = %L', key, value);
	});
	this.values
};
