var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , Migration = require('./migration')

var Runner = module.exports = function(options) {
  if (!options) options = {};
  this.migrateDir = path.resolve(
    options.dir || require('./config').paths.db.migrate
  );
  this.adapter = options.adapter || new require('./adapter')();
}

Runner.prototype = {
  load: function(callback) {
    var self = this;

    fs.readdir(this.migrateDir, function(err, migrateFiles) {
      if (err) return callback(err);

      var migrations = migrateFiles.sort().map(function(filename) {
        var impl = require(path.join(self.migrateDir, filename));
        return new Migration(filename, impl);
      });

      callback(null, migrations);
    });
  },
  run: function(migrations, verb, callback) {
    var migration = migrations.shift()
      , self = this;

    var query = {
      up: "INSERT INTO schema_migrations VALUES ('%s')", 
      down: "DELETE FROM schema_migrations WHERE v='%s'"
    };

    if (!migration) return callback(null, true);

    this.adapter.connect(function(err, conn, done) {
      conn.begin();

      migration[verb]().forEach(function(q) {
        conn.query(q.toSQL(self.adapter));
      });

      conn.query(util.format(query[verb], migration.version));

      conn.commit(function(err) {
        done();
        if (err) callback(err);
        else self.run(migrations, verb, callback);
      });
    });
  },
  version: function(callback) {
    this.adapter.connect(function(err, conn, done) {
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
  },
  migrate: function(version, callback) {
    var self = this;

    if (typeof version === 'function') {
      callback = version;
      version = undefined;
    }

    this.version(function(err, current) {
      if (err) return callback(err);

      self.load(function(err, migrations) {
        if (err) return callback(err);

        if (!version) version = migrations[migrations.length - 1].version;

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
          return callback(null, false);
        }

        self.run(candidates, verb, callback);
      });
    });
  },
  rollback: function(step, callback) {
    var self = this;

    if (!step) step = 1;
    this.version(function(err, current) {
      if (err) return callback(err);

      self.load(function(err, migrations) {
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

        self.run(candidates, 'down', callback);
      });
    });
  }
}
