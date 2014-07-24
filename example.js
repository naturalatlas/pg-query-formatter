var Query = require('./query.js');


// 1. Select
var sql = new Query('SELECT * FROM %I WHERE name = %L', 'teachers', 'George');
console.log('1. '+sql.toString());
//>> SELECT * FROM teachers WHERE name = 'George'


// 2. Array Expansion
var sql = new Query('SELECT * FROM teachers WHERE name IN (%L)', ['George', 'Jorge', 'Georgio']);
console.log('2. '+sql.toString());
//>> SELECT * FROM teachers WHERE name IN ('George', 'Jorge', 'Georgio')


// 3. Complex Select
var teachers = new Query('SELECT * FROM %I WHERE name = %L', 'teachers', 'George');
var students = new Query('SELECT * FROM %I WHERE name = %L', 'students', 'George');
var all = new Query('%Q UNION ALL %Q', teachers, students);
console.log('3. '+all.toString());
//>> SELECT * FROM teachers WHERE name = 'George' UNION ALL SELECT * FROM students WHERE name = 'George'


// 4. Query Lists
var where = new Query.List(' AND '); // make a list of queries separated by ' AND '
where.append("age > %L", 20)
where.append("age < %L", 30)
var sql = new Query('SELECT %I FROM teachers WHERE %Q', ['id', 'name'], where);
console.log('4. '+sql.toString());
//> SELECT id, name FROM teachers WHERE age > 20 AND age < 30


// 5. Update
var sql = new Query('UPDATE people SET %(%I = %L) WHERE id = %L', {name: 'George', age: 25, pet_id: null}, 4); 
console.log('5. '+sql.toString());
//>> UPDATE people SET name = 'George', age = 25, pet_id = NULL WHERE id = 4