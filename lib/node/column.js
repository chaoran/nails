var DbType = require('./dbType');

var Column = module.exports = function(name, type, options) {
  this.name = name;
  this.dbType = new DbType(type, options);

  if (options) {
    if (options.default !== undefined) {
      this.defaultValue = options.default;
    }
    if (options.null !== undefined) {
      this.notNull = (options.null === false);
    }
  }
}
