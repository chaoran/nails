var app = require('../app');

try {
  module.exports = require('./' + app.config.database.adapter)
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') throw err;

  var say = require('../say');
  if (app.config.database.adapter) 
    say.fatal('unsupported adapter: ' + app.config.database.adapter)
  else 
    say.fatal('cannot find field "adapter" in database config file');
}
