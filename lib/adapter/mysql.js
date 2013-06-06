var say = require('../../say')
  , mysql = require('mysql');

module.exports = function(app) {
  var connObj = {};
  var config = app.config.database;

  // load defaults
  for (var key in config) {
    switch (key) {
      case 'database': case 'password': case 'host': case 'port': case 'user':
        connObj[key] = config[key]; break;
      case 'pool': connObj.connetionLimit = config.pool; break;
    }
  }

  var pool = mysql.createPool(connObj);

  var adapter = {
    Connection: mysql.createConnection({}).constructor,
    connect: function(callback) {
      pool.getConnection(function(err, conn) {
        callback(err, conn, conn.end.bind(conn));
      });
    },
    close: function() {
      pool._allConnections.forEach(function(conn) {
        conn.destroy();
      });
    },
    createDb: function(callback) {
      var database = config.database;
      var encoding = config.encoding;
      var query = 'CREATE DATABASE `' + database + '`';

      if (encoding) query += 'DEFAULT CHARACTER SET ' + encoding;

      delete connObj.database;
      var conn = mysql.createConnection(connObj);
      connObj.database = database;

      conn.connect(function(err) {
        if (err) return callback(err);
        conn.query(query, function(err) {
          conn.destroy();
          if (err) return callback(err);
          say.create('database: "' + config.database + '"');
          callback(null);
        });
      });
    },
    dropDb: function(callback) {
      var database = config.database;
      var query = 'DROP DATABASE `' + database + '`';

      delete connObj.database;
      var conn = mysql.createConnection(connObj)
      connObj.database = database;

      conn.connect(function(err) {
        if (err) return callback(err);
        conn.query(query, function(err) {
          conn.destroy();
          if (err) return callback(err);
          say.drop('database: "' + config.database + '"');
          callback(null);
        });
      });
    }
  };

  Object.defineProperty(adapter, 'SchemaSqlVisitor', {
    get: function() {
      delete this.SchemaSqlVisitor;
      return this.SchemaSqlVisitor = require('./SchemaSqlVisitor');
    },
    configurable: true
  });

  return adapter;
}
