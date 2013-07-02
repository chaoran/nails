var mysql = require('mysql')
  , Adapter = require(__dirname)
  , Reporter = require('../reporter');

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
    , query = 'CREATE DATABASE `' + database + '`'
    , reporter = new Reporter('create', database);

  if (encoding) query += 'DEFAULT CHARACTER SET ' + encoding;

  delete this.connObj.database;
  var conn = mysql.createConnection(this.connObj);
  this.connObj.database = database;

  conn.connect(function(err) {
    if (err) return callback(err);
    conn.query(query, reporter.report(function(err) {
      conn.destroy();
      callback(err);
    }));
  });
};

MysqlAdapter.prototype.dropDb = function(callback) {
  var database = this.config.database
    , reporter = new Reporter('drop', database)
    , query = 'DROP DATABASE `' + database + '`';

  delete this.connObj.database;
  var conn = mysql.createConnection(this.connObj)
  this.connObj.database = database;

  conn.connect(function(err) {
    if (err) return callback(err);
    conn.query(query, reporter.report(function(err) {
      conn.destroy();
      callback(err);
    }));
  });
};
