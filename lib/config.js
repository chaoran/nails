var path = require('path')
  , ENV = process.env.NODE_ENV || 'development';

var config = module.exports = {
  paths: {
    root: process.cwd(),
    config: {
      database: 'config/database' 
    },
    db: {
      migrate: 'db/migrate'
    },
    package: 'package.json'
  },
  get database() {
    var p = path.join(this.paths.root, this.paths.config.database);
    return require(p)[ENV];
  }
};

Object.defineProperty(config, 'package', {
  get: function() {
    if (!this._package) {
      Object.defineProperty(config, '_package', {
        value: require(path.join(this.paths.root, this.paths.package))
      });
    }
    return this._package;
  },
  set: function(p) {
    this._package = p;
  },
});
