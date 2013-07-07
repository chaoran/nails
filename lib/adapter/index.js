var serialize = require('serialize')
  , util = require('util');

var instance;

var Adapter = module.exports = function(config) {
  if (this == global) {
    if (config) {
      var Adapter = require('./' + config.adapter);
      return instance = new Adapter(config);
    }

    if (instance) return instance;

    config = require('../config')();
    var Adapter = require('./' + config.database.adapter);
    return instance = new Adapter(config.database);
  }

  this.name = config.adapter;
  this.config = config;

  // add transaction support
  this.constructor.Connection.prototype.begin = function(callback) {
    var that = this;
    this.query = serialize(this.query);
    this.query('BEGIN', callback);

    this.commit = function(callback) {
      that.query("COMMIT", function(err) {
        that.query = that.query.free(); 
        if (err) that.query("ROLLBACK", function() { callback(err); });
        else callback(null);
      });
    }; 
  };
};

Adapter.extend = function(ctor) {
  if (!ctor) constructor = function() {
    Adapter.apply(this, arguments);
  } 
  else constructor = function() {
    Adapter.apply(this, arguments);
    ctor.apply(this, arguments);
  }

  util.inherits(constructor, Adapter);
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
