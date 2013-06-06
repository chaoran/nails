var Adapter = require(__dirname)
  , say = require('../say')
  , pg = require('pg');

var PostgresAdapter = module.exports = Adapter.extend(function(config) {
  for (var key in config) {
    switch (key) {
      case 'database': case 'password': case 'host': case 'port': 
        pg.defaults[key] = config[key]; break;
      case 'pool': pg.defaults.poolSize = config.pool; break;
      default: 
    }
  }

  Object.defineProperty(this, 'Parser', {
    get: function() {
      delete this.Parser;
      return this.Parser = require('./parser/postgres');
    },
    configurable: true
  });
});

// preprocess query's result object
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
};

PostgresAdapter.Connection = pg.Client;

PostgresAdapter.prototype.connect = pg.connect.bind(pg);

PostgresAdapter.prototype.close = pg.end.bind(pg);

PostgresAdapter.prototype.createDb = function(callback) {
  var encoding = this.config.encoding
    , database = this.config.database
    , query = 'CREATE DATABASE "' + database + '"';

  if (encoding) query += " WITH encoding='" + encoding + "'";

  var client = new pg.Client({ database: 'postgres' });
  client.connect(function(err) {
    if (err) return callback(err);
    client.query(query, function(err) {
      client.end();
      if (err) return callback(err);
      say.create('database: "' + database + '"');
      callback(null);
    });
  });
};

PostgresAdapter.prototype.dropDb = function(callback) {
  var database = this.config.database;
  var query = 'DROP DATABASE "' + database + '"';

  var client = new pg.Client({ database: 'postgres' });
  client.connect(function(err) {
    if (err) return callback(err);
    client.query(query, function(err) {
      client.end();
      if (err) return callback(err);
      say.drop('database: "' + database + '"');
      callback(null);
    });
  });
};
