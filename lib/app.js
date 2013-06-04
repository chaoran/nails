var path = require('path')
  , fs = require('fs')
  , say = require('./say')

var root = process.cwd();
var pkg;
do {
  var pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    pkg = require(pkgPath);
    if (pkg.dependencies.neutron) break;
  }
} while ((root = path.dirname(root)) != '/');

if (root === '/') say.fatal('current direcotry is not a neutron app');
else root = path.relative(process.cwd(), root);

var app = {
  root: root,
  name: pkg.name,
  version: pkg.version,
  env: process.env.NODE_ENV || 'development'
};

Object.defineProperty(app, 'config', {
  get: function() {
    delete this.config;
    this.config = require('./config');
    this.config.app = this;
    return this.config;
  },
  configurable: true,
});

module.exports = app;
