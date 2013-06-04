var path = require('path')
  , fs = require('fs')

var neutron = function(root) {
  if (neutron.current) return neutron.current;

  if (!root) root = process.cwd();
  var pkg;
  do {
    var pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
      pkg = require(pkgPath);
      if (pkg.dependencies.neutron) break;
    }
  } while ((root = path.dirname(root)) != '/');

  if (root === '/') 
    require('./lib/say').fatal('current direcotry is not a neutron app');
  else 
    root = path.relative(process.cwd(), root);

  var app = {
    root: root,
    name: pkg.name,
    version: pkg.version,
    env: process.env.NODE_ENV || 'development'
  };

  Object.defineProperty(app, 'config', {
    get: function() {
      delete this.config;
      return this.config = require('./lib/config')(app);
    },
    configurable: true
  });

  Object.defineProperty(app, 'adapter', {
    get: function() {
      delete this.adapter;
      return this.adapter = require('./lib/adapter')(app);
    },
    configurable: true
  });

  Object.defineProperty(app, 'migrator', {
    get: function() {
      delete this.migrator;
      return this.migrator = require('./lib/migrator')(app);
    },
    configurable: true
  });

  return neutron.current = app;
};

Object.defineProperty(neutron, 'Jakefile', {
  get: function() {
    delete this.Jakefile;
    return this.Jakefile = require('./lib/Jakefile');
  },
  configurable: true
});

Object.defineProperty(neutron, 'current', {
  enumerable: false,
  writable: true,
  configurable: true
});

module.exports = neutron;
