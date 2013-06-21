var Adapter = module.exports = function(config) {
  if (this === global) return new (require('./' + config.adapter))(config);

  this.name = config.adapter;
  this.config = config;

  // add transaction api 
  this.constructor.Connection.prototype.begin = function(callback) {
    var that = this;
    var query = this.query;
    var _query = query;
    var queue = [];

    var wrapper = function(args) {
      var q = query.apply(that, args);
      if (!q) return;

      q.once('error', function(err) {
        query = function(sql, callback) {
          if (callback) {
            _query.call(that, "ROLLBACK", function() {
              callback(err);
            });
          } else {
            queue.shift();
            var next = queue[0];
            if (next) next();
          }
        };
      });
      q.once('end', function() {
        queue.shift();
        var next = queue[0];
        if (next) next();
      });
    };

    this.query = function() {
      var args = [].slice.call(arguments);
      queue.push(function() { wrapper(args); });
      if (queue.length === 1) queue[0]();
    };

    this.commit = function(callback) {
      that.query('COMMIT', function(err) {
        that.query = _query;
        delete that.commit;
        callback(err);
      });
    };

    this.query('BEGIN', callback);
  };
}

Adapter.extend = function(ctor) {
  if (!ctor) constructor = function() {
    Adapter.apply(this, arguments);
  } 
  else constructor = function() {
    ctor.apply(this, arguments);
    Adapter.apply(this, arguments);
  }

  require('util').inherits(constructor, Adapter);
  return constructor;
}

Adapter.prototype.connected = function(func) {
  var self = this;
  return function() {
    var that = this;
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    self.connect(function(err, conn, done) {
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
