var path = require('path')
  , fs = require('fs')

var config = module.exports = {
  path: {
    root: null,
    config: {
      database: 'config/database' 
    },
    db: {
      migrate: 'db/migrate'
    },
    package: 'package.json'
  },
  get root() {
    if (this.path.root) return this.path.root;

    // Find application root:
    // Try to find a directory that has a package.json file at path.package 
    // AND the package file contains a dependency on 'neutron'
    var root = process.cwd();
    do {
      try {
        var package = require(path.join(root, this.path.package));
        if (package.dependencies.neutron) {
          this.path.root = root;
          this.package = package; // also set this.package
          break;
        }
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') throw err;
      }
    } while (!this.path.root && (root = path.dirname(root)) != '/');

    return this.path.root;
  },
  get database() {
    var p = path.join(this.root, this.path.config.database);
    return require(p)[process.env.NODE_ENV || 'development'];
  },
};
