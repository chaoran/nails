var say = require('../../say')
  , pg = require('pg');

var query = pg.Client.prototype.query;
pg.Client.prototype.query = function() {
  var callback = arguments[arguments.length - 1];

  if (typeof callback === 'function') {
    arguments[arguments.length - 1] = function(err, result) {
      if (result && result.rows !== undefined) result = result.rows;
      callback(err, result);
    };
  }

  return query.apply(this, arguments);
}

module.exports = function(app) {
  var config = app.config.database;

  for (var key in config) {
    switch (key) {
      case 'database': case 'password': case 'host': case 'port': 
        pg.defaults[key] = config[key]; break;
      case 'pool': pg.defaults.poolSize = config.pool; break;
      default: 
    }
  }

  var adapter = {
    Connection: pg.Client,
    connect: pg.connect.bind(pg),
    close: pg.end.bind(pg),
    createDb: function(callback) {
      var encoding = config.encoding
        , query = 'CREATE DATABASE "' + config.database + '"';

      if (encoding) query += " WITH encoding='" + encoding + "'";

      var client = new pg.Client({ database: 'postgres' });
      client.connect(function(err) {
        if (err) return callback(err);
        client.query(query, function(err) {
          client.end();
          if (err) return callback(err);
          say.create('database: "' + config.database + '"');
          callback(null);
        });
      });
    },
    dropDb: function(callback) {
      var query = 'DROP DATABASE "' + config.database + '"';

      var client = new pg.Client({ database: 'postgres' });
      client.connect(function(err) {
        if (err) return callback(err);
        client.query(query, function(err) {
          client.end();
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
