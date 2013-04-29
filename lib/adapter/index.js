var Adapter = module.exports = function(config) {
  for (var key in config) {
    if (this[key] === undefined) {
      if (key === 'adapter') {
        this.name = config.adapter;
      } else {
        this[key] = config[key];
      }
    }
  }
};

Adapter.make = function(config) {
  config = config || require('../config').database;
  try {
    var Adapter = require('./' + config.adapter)
      , adapter = new Adapter(config);
    return adapter;
  } catch (e) {
    throw new Error('unsupported adapter: ' + config.database.adapter);
  }
};
