var app = require('../../../index')()
  , say = require('../../say')
  , pg = require('pg');

// load defaults
var config = app.config.database;

for (var key in config) {
  switch (key) {
    case 'database': case 'password': case 'host': case 'port': 
      pg.defaults[key] = config[key]; break;
    case 'pool': pg.defaults.poolSize = config.pool; break;
    default: 
  }
}

pg.Client.prototype.begin = function(callback) {
  this.query('BEGIN', callback);
};

pg.Client.prototype.commit = function(callback) {
  this.query('commit', callback);
};

module.exports = {
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
  },
  SchemaSqlVisitor: require('./SchemaSqlVisitor')
}
