var say = require('../say')
  , fs = require('fs')
  , path = require('path')

var migrator = module.exports = function(app) {
  var adapter = app.adapter;
  var Migration = require('./migration')(adapter);
  var directory = path.join(path.resolve(app.root), app.config.path.db.migrate);

  function load(callback) {
    return fs.readdirSync(directory)
    .sort()
    .map(function(file) {
      return new Migration(file, require(path.join(directory, file)));
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

  function report(callback) {
    return function(err) {
      if (err) { 
        adapter.close(); 
        callback(err); 
      } else {
        Migration.version(function(err, version) {
          if (err) {
            adapter.close(); callback(err);
          } else {
            say.version(version); 
            adapter.close(); 
            callback(err);
          }
        });
      }
    }
  }

  return {
    migrate: function(version, callback) {
      callback = report(callback);
      Migration.version(function(err, current) {
        if (err) return callback(err);

        var migrations = load();
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
      callback = report(callback);
      step = step || 1;
      Migration.version(function(err, current) {
        if (err) return callback(err);

        var migrations = load();
        var candidates = [];
        for (var i = migrations.length - 1; i >= 0; --i) {
          if (migrations[i].version === current) {
            while (step-- > 0 && i >= 0) candidates.push(migrations[i--]);
            break;
          }
        }

        if (candidates.length === 0) callback(null);
        else run(candidates, 'down', callback);
      });
    },
    version: function(callback) {
      report(callback)(null);
    }
  }
}
