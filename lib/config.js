var path = require('path');

var config = {
  path: {
    config: 'config',
    db: {
      migrate: 'db/migrate'
    }
  }
};

Object.defineProperty(config, 'database', {
  get: function() {
    delete this.database;
    return this.database = require(
      path.join(path.resolve(this.app.root), this.path.config, 'database.js')
    )[this.app.env];
  },
  configurable: true
});

module.exports = config;
