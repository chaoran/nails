var Adapter = require(__dirname)
  , say = require('../say')
  , mysql = require('mysql');

var MysqlAdapter = module.exports = Adapter.extend(function(config) {
  this.config = config;
  this.connObj = {};

  for (var key in config) {
    switch (key) {
      case 'database': case 'password': case 'host': case 'port': case 'user':
        this.connObj[key] = config[key]; break;
      case 'pool': this.connObj.connetionLimit = config.pool; break;
    }
  }

  this.pool = mysql.createPool(this.connObj);

  Object.defineProperty(this, 'Parser', {
    get: function() {
      delete this.Parser;
      return this.Parser = require('./parser/mysql');
    },
    configurable: true
  });
});

MysqlAdapter.Connection = mysql.createConnection({}).constructor;

MysqlAdapter.prototype.connect = function(callback) {
  this.pool.getConnection(function(err, conn) {
    callback(err, conn, conn.end.bind(conn));
  });
};

MysqlAdapter.prototype.close = function() {
  this.pool._allConnections.forEach(function(conn) {
    conn.destroy();
  });
};

MysqlAdapter.prototype.createDb = function(callback) {
  var database = this.config.database
    , encoding = this.config.encoding
    , query = 'CREATE DATABASE `' + database + '`';

  if (encoding) query += 'DEFAULT CHARACTER SET ' + encoding;

  delete this.connObj.database;
  var conn = mysql.createConnection(this.connObj);
  this.connObj.database = database;

  conn.connect(function(err) {
    if (err) return callback(err);
    conn.query(query, function(err) {
      conn.destroy();
      if (err) return callback(err);
      say.create('database: "' + database + '"');
      callback(null);
    });
  });
};

MysqlAdapter.prototype.dropDb = function(callback) {
  var database = this.config.database;
  var query = 'DROP DATABASE `' + database + '`';

  delete this.connObj.database;
  var conn = mysql.createConnection(this.connObj)
  this.connObj.database = database;

  conn.connect(function(err) {
    if (err) return callback(err);
    conn.query(query, function(err) {
      conn.destroy();
      if (err) return callback(err);
      say.drop('database: "' + database + '"');
      callback(null);
    });
  });
};
