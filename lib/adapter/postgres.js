var pg = require('pg')
  , Adapter = require(__dirname)
  , Reporter = require('../reporter')

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

PostgresAdapter.prototype.connect = function(callback) {
  pg.connect(callback);
};

PostgresAdapter.prototype.close = function() {
  pg.end()
};

PostgresAdapter.prototype.createDb = function(callback) {
  var encoding = this.config.encoding
    , database = this.config.database
    , query = 'CREATE DATABASE "' + database + '"'
    , reporter = new Reporter('create', database);

  if (encoding) query += " WITH encoding='" + encoding + "'";

  var client = new pg.Client({ database: 'postgres' });
  client.connect(function(err) {
    if (err) return callback(err);

    client.query(query, reporter.report(function() {
      client.end();
    }, callback));
  });
};

PostgresAdapter.prototype.dropDb = function(callback) {
  var database = this.config.database
    , query = 'DROP DATABASE "' + database + '"'
    , reporter = new Reporter('drop', database);

  var client = new pg.Client({ database: 'postgres' });

  client.connect(function(err) {
    if (err) return callback(err);
    client.query(query, reporter.report(function() {
      client.end();
    }, callback));
  });
};
