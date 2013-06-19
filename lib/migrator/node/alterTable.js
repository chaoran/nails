var Node = require(__dirname)
  , AddColumn = require('./addColumn')
  , AlterColumn = require('./alterColumn')
  , RenameColumn = require('./renameColumn')
  , DropColumn = require('./dropColumn')
  , CreateIndex = require('./createIndex');

var AlterTable = module.exports = Node.define(
  'AlterTable', 
  function(name) {
    this.name = name;
  }
);

AlterTable.prototype.column = function(name, type, options) {
  this.add(new AddColumn(name, type, options));
};

AlterTable.prototype.references = function(name, options) {
  this.add(new AddColumn(name.toLowerCase() + '_id', 'id', options));
};

AlterTable.prototype.change = function(name, type, options) {
  this.add(new AlterColumn(name, type, options));
};

AlterTable.prototype.rename = function(name, new_name) {
  this.add(new RenameColumn(name, new_name));
};

AlterTable.prototype.remove = function(name) {
  this.add(new DropColumn(name));
};

AlterTable.prototype.index = function(columns, options) {
  this.add(new CreateIndex(this.name, columns, options));
};

Node.includeColumnMethods(AlterTable);
