var identifier = require('./identifier')
  , column = require('./column');

var Table = function(name) {
  this.name = new Identifier(name);
  this.columns = [];
}

Table.prototype = {
  addColumn: function(name, type, options) {
    this.columns.push(new Column(name, type, options));
  }
  create: function() {
    var q = new Query();
    return q.create(this)
  }
}

