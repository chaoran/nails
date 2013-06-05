module.exports = function(app) {
  try {
    var adapter = require('./' + app.config.database.adapter)(app);

    // add adapter base methods
    adapter.connected = function(func) {
      return function() {
        var that = this;
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        adapter.connect(function(err, conn, done) {
          if (err) return callback(err);
          args.unshift(conn);
          args.push(function() {
            done();
            callback.apply(global, arguments);
          });
          func.apply(that, args);
        });
      }
    }

    // add transaction methods
    adapter.Connection.prototype.begin = function(callback) {
      this.query('BEGIN', callback);
    };

    adapter.Connection.prototype.commit = function(callback) {
      this.query('COMMIT', callback);
    };

    return adapter;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;

    var say = require('../say')
    .fatal('unrecognized adapter: ' + app.config.database.adapter)
  }
}
