var path = require('path')
  , fs = require('fs')

var cached;
var neutron = function(root) {
  if (cached) return cached;
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
      return this.adapter = require('./lib/adapter')(app.config.database);
    },
    configurable: true
  });

  Object.defineProperty(app, 'migrator', {
    get: function() {
      delete this.migrator;
      return this.migrator = require('./lib/migration')(app);
    },
    configurable: true
  });

  return cached = app;
};

Object.defineProperty(neutron, 'Jakefile', {
  get: function() {
    delete this.Jakefile;
    return this.Jakefile = require('./lib/Jakefile');
  },
  configurable: true
});

module.exports = neutron;
