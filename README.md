# pg-query-formatter

A simple, lightweight, and flexible way to format and escape postgres queries using a printf-like syntax.

```sh
$ npm install pg-query-formatter --save
```

```js
var Query = require('pg-query-formatter');
var sql = new Query('SELECT * FROM %I WHERE %I = %L', 'teachers', 'name', 'george');

sql.toString();
// "SELECT * FROM teachers WHERE name = 'george'"
sql.toParam();
// { text: 'SELECT * FROM teachers WHERE name = $1', values: [ 'george' ] }
```

#### Format Specifiers

- **`%s`** – String (unescaped)
- **`%I`** – Identifier
- **`%L`** – Literal (string or number)
- **`%Q`** – Subquery 
- **`%(fmt)`** : Object 
	+ **`%(%I = %L)`** – Assignment lists `{id: 5, name: 'george'}`
	+ **`%(%s %s)`** – Column definitions `{id: 'integer', name: 'text'}`

#### Constructors
- `new Query()`
- `new Query(string fmt, values...)`
- `new Query.List(string separator)`

#### Methods
- `append(string fmt, values...)`
- `toString()`
- `toParam()`


### Examples

```js
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
//>> SELECT id, name FROM teachers WHERE age > 20 AND age < 30


// 5. Update
var sql = new Query('UPDATE people SET %(%I = %L) WHERE id = %L', {name: 'George', age: 25, pet_id: null}, 4); 
console.log('5. '+sql.toString());
//>> UPDATE people SET name = 'George', age = 25, pet_id = NULL WHERE id = 4
```

## License

Copyright &copy; 2014 [Brandon Reavis](https://github.com/brandonreavis) & [Contributors](https://github.com/naturalatlas/pg-query-formatter/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
