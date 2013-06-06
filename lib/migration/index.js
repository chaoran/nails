var say = require('./say')
  , fs = require('fs')
  , path = require('path')

var migrator = module.exports = function(app) {
  var adapter = app.adapter;
  var Migration = require('./migration')(adapter);
  var migrateDir = app.config.path.db.migrate;

  function loadMigrations(callback) {
    return fs.readdirSync(migrateDir)
    .sort()
    .map(function(file) {
      var impl = require(path.join(path.resolve(app.root), migrateDir, file));
      return new Migration(file, impl);
    });
  }

  function run(migrations, verb, callback) {
    var migration = migrations.shift()

    migration[verb](function(err) {
      if (err) return callback(err);
      if (migrations.length > 0) run(migrations, verb, callback);
      else callback(null);
    });
  }

  function safeCallback(callback) {
    return function(err) {
      if (err) {
        adapter.close();
        return callback(err);
      }
      Migration.version(function(err, version) {
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
      Migration.version(function(err, current) {
        if (err) return callback(err);

        var migrations = loadMigrations();
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
        else run(candidates, verb, callback);
      });
    },
    rollback: function(step, callback) {
      callback = safeCallback(callback);
      step = step || 1;
      Migration.version(function(err, current) {
        if (err) return callback(err);

        var migrations = loadMigrations();
        var candidates = [];
        for (var i = migrations.length - 1; i >= 0; --i) {
          if (migrations[i].version === current) {
            while (step-- > 0) candidates.push(migrations[i--]);
            break;
          }
        }

        if (candidates.length === 0) callback(null);
        else run(candidates, 'down', callback);
      });
    },
    version: function(callback) {
      callback = safeCallback(callback);
      callback(null);
    }
  }
}
