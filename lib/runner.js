var fs = require('fs')
  , path = require('path')
  , config = require('./config');
  , adapter = require('./adapter');

function load(callback) {
  var migratePath = path.join(config.paths.root, config.paths.db.migrate);

  fs.readdir(migratePath, function(err, migrateFiles) {
    if (err) return callback(err);

    var migrations = migrateFiles.sort().map(function(filename) {
      var impl = require(path.join(migratePath, filename));
      return new Migration(filename, impl);
    });

    callback(null, migrations);
  });
}

function run(migrations, verb, callback) {
  var migration = migrations.shift();

  if (!migration) return callback(null, true);

  adapter.connect(function(err, conn, done) {
    conn.begin();

    migration[verb]().forEach(function(q) {
      conn.query(adapter.sqlize(q));
    });

    conn.query(util.format(
      "INSERT INTO schema_migrations VALUES ('%s')", 
      migration.version
    ));

    conn.commit(function(err) {
      done();
      if (err) callback(err);
      else run(migrations, verb, callback);
    });
  });
}

function last(callback) {
  adapter.connect(function(err, conn, done) {
    conn.query(
      'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      function(err, schema) {
        if (err) {
          if (err.message.indexOf('exist') < 0) {
            done();
            return callback(err);
          }

          return conn.query(
            'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
            function(err) {
              done();
              callback(err, 0);
            }
          );
        }
        done();
        callback(null, schema.v);
      }
    );
  });
}

module.exports = {
	version: current,
  migrate: function(version, callback) {
    last(function(err, current) {
      if (err) return callback(err);

      load(function(err, migrations) {
        if (err) return callback(err);

        var candidates, verb;
        if (version > current) {
          verb = 'up';
          candidates = migrations.filter(function(m) {
            return (m.version > current && m.version <= version);
          });
        } else {
          verb = 'down';
          candidates = migrations.filter(function(m) {
            return (m.version <= current && m.version > version);
          });
        }

        if (candidates.length === 0) {
          return callback(null, false);
        }

        run(candidates, verb, callback);
      });
    });
  },
  rollback: function(step, callback) {
    if (!step) step = 1;
    last(function(err, current) {
      if (err) return callback(err);

      load(function(err, migrations) {
        if (err) return callback(err);

        var candidates = [];
        for (var i = migrations.length - 1; i >= 0; --i) {
          if (migrations[i].version === current) {
            while (step-- > 0) {
              candidates.push(migrations[i--]);
            }
          }
        }

        if (candidates.length === 0) {
          return callback(null, false);
        }

        run(candidates, 'down', callback);
      });
    });
  }
}
