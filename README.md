pg-query-formatter
==================

A simple, lightweight, and flexible way to format and escape postgres queries using a printf-like syntax.

```js
var sql = new Query('SELECT * FROM %I WHERE %I = %L', 'teachers', 'name', 'george');
sql.toString();
//>  "SELECT * FROM teachers WHERE name = 'george'"

sql.toParam();
//> { 
//    text: 'SELECT * FROM teachers WHERE name = $1',
//    values: [ 'george' ] 
//  }

```

### Format Specifiers

- **%s** : String (unescaped)
- **%I** : Identifier
- **%L** : Literal (string or number)
- **%Q** : Subquery 
- **%(fmt)** : Object 
	+ **%($I = $L)** : assignment lists `{id: 5, name: 'george'}`
	+ **%($I $I)**   : column definitions `{id: 'integer', name: 'text'}`

### Examples

```js
//Select
var sql = new Query('SELECT * FROM %I WHERE name = %L', 'teachers', 'George');

//Array expansion
var sql = new Query('SELECT * FROM teachers WHERE name IN (%L)', ['George', 'Jorge', 'Georgio']);

//Complex Select
var teachers = new Query('SELECT * FROM %I WHERE name = %L', 'teachers', 'George');
var students = new Query('SELECT * FROM %I WHERE name = %L', 'students', 'George');
var all = new Query('%Q UNION ALL %Q', teachers, students);

//Query Lists
var where = new Query.List(' AND '); // make a list of queries separated by ' AND '
where.append("age > %I", 20)
where.append("age < %I", 30)
var sql = new Query('SELECT %I FROM teachers WHERE %Q', ['id', 'name'], where);

//Update
var sql = new Query('UPDATE TABLE people SET %(%I = %L) WHERE id = %L', {name: 'George', age: 25}, 4); 
```
