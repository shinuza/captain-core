"use strict";

var _ = require('underscore');


var QueryBuilder = module.exports = function QueryBuilder(table, fields) {
  this.table = table;
  this.f = fields
};

QueryBuilder.prototype = {
  fields: function fields() {
    return this.f.join(', ');
  },

  returning: function returning() {
    return ' RETURNING ' + this.fields();
  },

  select: function select() {
    return 'SELECT ' + this.fields() +  ' FROM ' + this.table;
  },

  insert: function insert(data) {
    var i = 1
      , fields = _.keys(data)
      , values = _.values(data)
      , placeholders = [];

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
  },

  update: function update(id, data) {
    var i = 1
      , values = _.values(data)
      , query = 'UPDATE ' + this.table + ' SET '
      , sets = [];

    _.each(data, function(value, key) {
      sets.push(key + ' = $' + i);
      i++;
    });
    query += sets.join(', ');
    query += ' WHERE id = $' + i;
    query += this.returning();
    values.push(id);
    return [query.toString(), values];
  },

  del: function del() {
    return 'DELETE FROM ' + this.table;
  }
};