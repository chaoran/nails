var Node = require(__dirname);

var DbType = module.exports = Node.define(
  'DbType', 
  function(name, options) {
    this.name = name;

    if (options) {
      if (options.limit) {
        this.limit = options.limit;
      } else if (options.precision) {
        this.precision = options.precision;
        if (options.scale) {
          this.scale = options.scale;
        }
      }
    }
  }
);

DbType.TYPES = [
  'binary',
  'boolean',
  'date',
  'datetime',
  'decimal',
  'float',
  'integer',
  'primaryKey',
  'string',
  'text',
  'time',
  'timestamp'
];

