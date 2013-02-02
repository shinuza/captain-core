var _ = require('underscore');

function QueryBuilder(table, fields) {
  this.table = table;
  this.f = fields
}
var p = QueryBuilder.prototype;

p.fields = function() {
  return this.f.join(', ');
};

p.returning = function() {
  return ' RETURNING ' + this.fields();
};

p.select = function select() {
  return 'SELECT ' + this.fields() +  ' FROM ' + this.table;
};

p.insert = function insert(data) {
  var i = 1;
  var fields = _.keys(data);
  var values = _.values(data);
  var placeholders = [];
  var query = 'INSERT INTO ' + this.table;

  _.each(data, function() {
    placeholders.push('$' + i);
    i++;
  });
  query += '(' + fields.join(',') + ')';
  query += ' VALUES ';
  query += '(' + placeholders.join(',') + ')';
  query += this.returning();
  return [query, values];
};

p.update = function update(id, data) {
  var i = 1;
  var values = _.values(data);
  var query = 'UPDATE ' + this.table + ' SET ';
  var sets = [];

  _.each(data, function(value, key) {
    sets.push(key + ' = $' + i);
    i++;
  });
  query += sets.join(', ');
  query += ' WHERE id = $' + i;
  query += this.returning();
  values.push(id);
  return [query.toString(), values];
};

p.del = function del() {
  return 'DELETE FROM ' + this.table;
};

module.exports = QueryBuilder;