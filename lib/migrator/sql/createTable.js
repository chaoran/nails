var Type = require('./type')
  , Token = require('./token')
  , DefineColumn = require('./defineColumn');

var CreateTable = module.exports = Token.define(
  'CreateTable', 
  function(name, options) {
    this.name = name;

    if (options.id !== false) this.serial(options.primaryKey || 'id', { 
      primaryKey: true 
    });
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
