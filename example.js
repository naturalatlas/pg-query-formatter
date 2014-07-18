var Query = require('./query.js');

function printInfo(name, query){
	console.log(name + ": ");
	console.log("string: ");
	console.log(query.toString());
	console.log("parameterized: ");
	console.log(query.toParam());
	console.log("")
}


var where = new Query.List(" AND ");
where.add("age > %L AND age < %L", 10, 20);
where.add("name IN (%L)", ['George', 'Jorge', 'Georgio', 'D\'wayne']);

var select1 = new Query('SELECT * FROM %I WHERE %Q', 'teachers', where);
var select2 = new Query('SELECT * FROM %I WHERE %Q', 'students', where);
var union = new Query('%Q UNION ALL %Q', select1, select2);

printInfo("Where clause", where);
printInfo("Select #1", select1);
printInfo("Select #2", select2);
printInfo("Union", union);
