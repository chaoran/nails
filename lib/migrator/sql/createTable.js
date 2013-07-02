var Type = require('./type')
  , Token = require('./token')
  , DefineColumn = require('./defineColumn');

var CreateTable = module.exports = Token.define(
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

CreateTable.prototype.references = function(name, options) {
  name = name.toLowerCase() + 'Id';
  this.add(new DefineColumn(name, 'integer', options));
};

Type.TYPES.forEach(function(type) {
  CreateTable.prototype[type] = function(name, options) {
    this.column(name, type, options);
  };
});
