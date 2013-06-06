var Adapter = module.exports = function(config) {
  if (this === global) return new (require('./' + config.adapter))(config);

  this.name = config.adapter;
  this.config = config;

  // add transaction api 
  this.constructor.Connection.prototype.begin = function(callback) {
    this.query('BEGIN', callback);
  };

  this.constructor.Connection.prototype.commit = function(callback) {
    this.query('COMMIT', callback);
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
