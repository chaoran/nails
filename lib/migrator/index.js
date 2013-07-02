var fs = require('fs')
  , path = require('path')
  , schema = require('./schema')
  , Adapter = require('../adapter')
  , Migration = require('./migration')
  , Parser = require('./parser')
  , Reporter = require('../reporter');

var Migrator = module.exports = function(app) {
  var adapter = Adapter(app.config.database)
    , parser = Parser(adapter.name)
    , directory = path.join(app.root, app.path.db.migrate);

  var load = function(from, to) {
    var files = fs.readdirSync(directory).filter(function(file) {
      var version = file.split('-')[0];
      return (version > from && version <= to);
    }).sort();

    return files.map(function(file) {
      return new Migration(path.join(directory, file));
    });
  }

  var run = function(conn, migrations, verb, callback) {
    if (migrations.length === 0) return callback(null);

    var migration = migrations.shift()
      , reporter = new Reporter(verb, migration.version)
      , queries = migration[verb]();

    queries = queries.map(function(q) {
      return parser.visit(q);
    });

    conn.begin();

    if (verb === 'up') schema.insert(conn, migration.version);
    else schema.remove(conn, migration.version);

    for (var i = 0, l = queries.length; i < l; ++i) {
      conn.query(queries[i]);
    }

    conn.commit(reporter.report(function(err) {
      if (err) return callback(err);
      run(conn, migrations, verb, callback);
    }));
  };

  this.migrate = adapter.connected(function(conn, version, callback) {
    schema.last(conn, 1, function(err, versions) {
      if (err) return callback(err);

      var current = versions[0]
        , migrations, verb;

      if (version > current) {
        verb = 'up';
        migrations = load(current, version);
      } else {
        verb = 'down';
        migrations = load(version, current).reverse();
      }

      run(conn, migrations, verb, callback);
    });
  });

  this.rollback = adapter.connected(function(conn, step, callback) {
    schema.last(conn, step + 1, function(err, versions) {
      if (err) return callback(err);

      var from = versions[step] || '0'
        , to = versions[0] || '0'
        , migrations = load(from, to).reverse();

      run(conn, migrations, 'down', callback);
    });
  });

  this.version = adapter.connected(function(conn, callback) {
    var reporter = new Reporter('version');

    schema.last(conn, 1, reporter.report(function(err, versions) {
      if (err) return err;
      else this.target = versions[0];
    }, callback));
  });
};
