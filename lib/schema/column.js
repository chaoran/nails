var Identifier = require('./identifier')
  , DbType = require('./dbType');

var Column = function(name, type, options) {
  this.name = new Identifier(name);
  this.type = new DbType(type, options);

  if (options) {
    this.notNull = (options.null === false);
    this.defaultValue = options.default;
  }
}

