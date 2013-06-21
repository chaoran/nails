var say = require('../say')
  , fs = require('fs')
  , path = require('path')

var Migrator = module.exports = function(app) {
  if (this === global) {
    return new Migrator(app);
  }

  var adapter = app.adapter;
  var folder = path.join(app.root, app.config.path.db.migrate);
  var Migration = require('./migration')(app.adapter);

  var migrations = [];
  if (fs.existsSync(folder)) { 
    migrations = fs.readdirSync(folder).sort().map(function(file) {
      return new Migration(file, require(path.join(folder, file)));
    });
  }

  var getVersion = Migration.version.bind(Migration);

  function report(callback) {
    return function(err) {
      if (err) { 
        adapter.close(); 
        callback(err); 
      } else {
        getVersion(function(err, version) {
          if (err) {
            adapter.close(); callback(err);
          } else {
            say.version(version); 
            adapter.close(); 
            callback(err);
          }
        });
      }
    };
  }

  function run(migrations, verb, callback) {
    var migration = migrations.shift()

    migration[verb](function(err) {
      if (err) return callback(err);
      if (migrations.length > 0) run(migrations, verb, callback);
      else callback(null);
    });
  }

  this.migrate = function(version, callback) {
    getVersion(function(err, current) {
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

      if (candidates.length === 0) {
        adapter.close();
        callback(null);
      } else run(candidates, verb, function(err) {
        adapter.close();
        callback(err);
      });
    });
  }

  this.rollback = function(step, callback) {
    step = step || 1;

    getVersion(function(err, current) {
      if (err) return callback(err);

      var candidates = [];
      for (var i = migrations.length - 1; i >= 0; --i) {
        if (migrations[i].version === current) {
          while (step-- > 0 && i >= 0) candidates.push(migrations[i--]);
          break;
        }
      }

      if (candidates.length === 0) {
        adapter.close();
        callback(null);
      } else run(candidates, 'down', function(err) {
        adapter.close();
        callback(err);
      });
    });
  };

  this.version = function(callback) {
    report(callback)(null);
  };
};
