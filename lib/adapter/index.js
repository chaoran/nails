module.exports = function(app) {
  try {
    var name = app.config.database.adapter;
    var adapter = require('./' + name)(app);

    // add adapter base methods
    adapter.name = name;

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
