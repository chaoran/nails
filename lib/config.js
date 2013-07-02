var path = require('path');

var instance;

var Config = module.exports = function(app) {
  if (this === global) {
    if (instance) return instance;
    return instance = new Config(require('./app')());
  }

  this.path = {
    config: 'config',
    db: {
      migrate: 'db/migrate'
    }
  }

  Object.defineProperty(this, 'database', {
    get: function() {
      delete this.database;
      var filepath = path.join(app.root, this.path.config, 'database');
      return this.database = require(filepath)[app.env];
    },
    configurable: true
  });
}
