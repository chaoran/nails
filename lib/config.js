module.exports = function(neutron) {
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
      var path = require('path');
      return this.database = require(
        path.join(path.resolve(neutron.root), this.path.config, 'database.js')
      )[neutron.env];
    },
    configurable: true
  });

  return config;
}
