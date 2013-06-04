module.exports = function(app) {
  try {
    var adapter = require('./' + app.config.database.adapter)
    return adapter;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;

    var say = require('../say')
    .fatal('unrecognized adapter: ' + app.config.database.adapter)
  }
}
