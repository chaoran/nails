var Node = require(__dirname)
  , DefineColumn = require('./defineColumn');

var CreateTable = module.exports = Node.define(
  'CreateTable', 
  function(name, options) {
    this.name = name;

    options = options || {};
    if (options.id !== false) {
      var primaryKey = options.primaryKey || 'id';
      this.primaryKey(primaryKey);
    }
  }
);

CreateTable.prototype.column = function(name, type, options) {
  this.add(new DefineColumn(name, type, options));
};

Node.includeColumnMethods(CreateTable);
