var path = require('path');

var instance;

function locateApp() {
  var root = process.cwd()

  do {
    try {
      if (require(root + '/package.json').dependencies.neutron) break;
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") throw err;
    }
  } while ((root = path.dirname(root)) != '/');

  if (root === '/') throw new Error('cannot find app root directory');

  return root;
}

var App = module.exports = function(root) {
  if (this === global) {
    if (instance) return instance;

    root = root || locateApp();
    return instance = new App(root);
  }

  this.root = root;
  this.env = process.env.NODE_ENV || 'development';

  Object.defineProperty(this, 'config', {
    get: function() {
      delete this.config;
      return this.config = require('./config')(this);
    },
    configurable: true
  });
};
