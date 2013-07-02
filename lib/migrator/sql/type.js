var Type = module.exports = function(name, options) {
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
};

Type.TYPES = [ 
  'binary', 'boolean', 'date', 'datetime', 'decimal', 'float',
  'integer', 'primaryKey', 'string', 'text', 'time', 'timestamp'
];
