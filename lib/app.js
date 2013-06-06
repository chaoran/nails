var App = module.exports = function(root, package) {
  this.root = root,
  this.name = package.name,
  this.version = package.version,
  this.env = process.env.NODE_ENV || 'development'

  Object.defineProperty(this, 'config', {
    get: function() {
      delete this.config;
      return this.config = require('./config')(this);
    },
    configurable: true
  });

  Object.defineProperty(this, 'adapter', {
    get: function() {
      delete this.adapter;
      return this.adapter = require('./adapter')(this.config.database);
    },
    configurable: true
  });

  Object.defineProperty(this, 'migrator', {
    get: function() {
      delete this.migrator;
      return this.migrator = require('./migrator')(this);
    },
    configurable: true
  });
};
