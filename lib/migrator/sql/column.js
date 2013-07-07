var Type = require('./type');

module.exports = function(name, type, options) {
  this.name = name;
  this.datatype = new Type(type, options);

  if (options) {
    if (options.default !== undefined) {
      this.defaultValue = options.default;
    }
    if (options.null !== undefined) {
      this.notNull = (options.null === false);
    }
    if (options.primaryKey === true) {
      this.primaryKey = true;
    }
  }
};
