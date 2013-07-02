var Type = require('./type')
  , Token = require('./token')
  , Column = require('./column');

var AddColumn = Token.define('AddColumn', Column)
  , AlterColumn = Token.define('AlterColumn', Column)
  , DropColumn = Token.define('DropColumn', Column);

var RenameColumn = Token.define('RenameColumn', function(name, new_name) {
  this.name = name;
  this.newName = new_name;
});

var AlterTable = module.exports = Token.define(
  'AlterTable', 
  function(name) { this.name = name; }
);

AlterTable.prototype.column = function(name, type, options) {
  this.add(new AddColumn(name, type, options));
};

AlterTable.prototype.references = function(name, options) {
  name = name.toLowerCase() + 'Id';
  this.add(new AddColumn(name, 'integer', options));
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

Type.TYPES.forEach(function(type) {
  AlterTable.prototype[type] = function(name, options) {
    this.column(name, type, options);
  };
});

//AlterTable.prototype.index = function(columns, options) {
  //this.add(new CreateIndex(this.name, columns, options));
//};
