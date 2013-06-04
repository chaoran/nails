var path = require('path');

var config = module.exports = {
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
    var filepath = path.join(this.app.root, this.path.config, 'database.js');
    return this.database = require(filepath)[this.app.env];
  },
  configurable: true
});
