var config = require('../config'),
  , adapter;

try {
  adapter = require('./' + config.database.adapter);
} catch (e) {
  throw new Error('unsupported adapter: ' + config.database.adapter);
}

module.exports = adapter;
