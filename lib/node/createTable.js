var Node = require(__dirname)
  , DefineColumn = require('./defineColumn');

var CreateTable = module.exports = Node.define(
  'CreateTable', 
  function(name, options) {
    this.name = name;
  }
);

CreateTable.prototype.column = function(name, type, options) {
  this.add(new DefineColumn(name, type, options));
};

Node.includeColumnMethods(CreateTable);
