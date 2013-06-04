var Migration = require('./migration')
  , say = require('./say')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')

var migrator = module.exports = function(app) {
  var query = {
    up: "INSERT INTO schema_migrations VALUES ('%s')", 
    down: "DELETE FROM schema_migrations WHERE v='%s'"
  };

  var adapter = app.adapter;

  function loadMigrations(callback) {
    fs.readdir(app.config.path.db.migrate, function(err, files) {
      if (err) return callback(err);

      var migrations = files.sort().map(function(file) {
        var impl = require(path.join(
          path.resolve(app.root), 
          app.config.path.db.migrate, 
          file
        ));
        return new Migration(file, impl);
      });

      callback(null, migrations);
    });
  }

  function runMigration(migrations, verb, callback) {
    var migration = migrations.shift()
    if (!migration) return callback(null);

    adapter.connect(function(err, conn, done) {
      if (err) return callback(err);

      if (verb === 'up') say.migrate(migration.name);
      else say.rollback(migration.name);

      conn.begin();

      migration[verb]().forEach(function(q) {
        conn.query(q.toSQL(adapter));
      });

      conn.query(util.format(query[verb], migration.version));
      conn.commit(function(err) {
        done();
        if (err) return callback(err);
        runMigration(migrations, verb, callback);
      });
    });
  }

  function getVersion(callback) {
    adapter.connect(function(err, conn, done) {
      if (err) { done(); return callback(err); }
      conn.query(
        'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
        function(err, schema) {
          if (err) {
            if (err.message.indexOf('exist') < 0) {
              done(); return callback(err);
            } else {
              return conn.query(
                'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
                function(err) {
                  done();
                  callback(err, 0);
                }
              );
            }
          }
          done();
          callback(null, schema.rowCount > 0? schema.rows[0].v : 0);
        }
      );
    });
  }

  function safeCallback(callback) {
    return function(err) {
      if (err) {
        adapter.close();
        return callback(err);
      }
      getVersion(function(err, version) {
        adapter.close();
        if (err) return callback(err);
        say.version(version);
        callback(null);
      });
    }
  }

  return {
    migrate: function(version, callback) {
      callback = safeCallback(callback);
      getVersion(function(err, current) {
        if (err) return callback(err);

        loadMigrations(function(err, migrations) {
          if (err) return callback(err);

          version = version || migrations[migrations.length - 1].version;

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
            }).reverse();
          }

          if (candidates.length === 0) callback(null);
          else runMigration(candidates, verb, callback);
        });
      });
    },
    rollback: function(step, callback) {
      callback = safeCallback(callback);
      step = step || 1;
      getVersion(function(err, current) {
        if (err) return callback(err);

        loadMigrations(function(err, migrations) {
          if (err) return callback(err);

          var candidates = [];
          for (var i = migrations.length - 1; i >= 0; --i) {
            if (migrations[i].version === current) {
              while (step-- > 0) candidates.push(migrations[i--]);
              break;
            }
          }

          if (candidates.length === 0) callback(null);
          else runMigration(candidates, 'down', callback);
        });
      });
    },
    version: function(callback) {
      callback = safeCallback(callback);
      callback(null);
    }
  }
}
