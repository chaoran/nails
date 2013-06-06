var assert = require('assert')
  , util = require('util')
  , adapter = require('../lib/adapter')
  , migrator = require('../lib/migrator')
  , Migration = require('../lib/migration')

var FakeDb = function() {
  this.logs = [];
  this.schemas = [];
};

FakeDb.prototype.fetch = function() {
  var logs = this.logs;
  this.logs = [];
  return logs;
};

FakeDb.prototype.connect = function(callback) {
  var that = this;
  var conn = {
    begin: function() {
      that.logs.push('BEGIN');
    },
    query: function(q, callback) {
      that.logs.push(q);

      if (q.indexOf('SELECT v FROM schema_migrations') == 0) {
        if (that.schemas.length === 0) 
          return callback(new Error('does not exists'));
        else 
          return callback(null, that.schemas[that.schemas.length - 1]);
      }

      if (q.indexOf('INSERT INTO schema_migrations') == 0) {
        that.schemas.push({ v: q.match(/[0-9]{14}/)[0] });
      }

      if (q.indexOf('DELETE FROM schema_migrations') == 0) {
        var v = q.match(/[0-9]{14}/)[0];
        that.schemas = that.schemas.filter(function(schema) {
          return (schema.v !== v)
        });
      }

      if (callback) callback(null);
    },
    commit: function(callback) {
      that.logs.push('COMMIT');
      callback();
    }
  }

  callback(null, conn, function() {});
};

var FakeRunner = function(adapter) {
  this.adapter = adapter;
  this.db = new FakeDb();
};

FakeRunner.prototype.up = function(migrations) {
  var results = [];
  results.push('SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1');

  if (this.db.schemas.length === 0) {
    results.push('CREATE TABLE schema_migrations (v varchar(17) UNIQUE)');
  }

  for (var i = 0, l = migrations.length; i < l; ++i) {
    var m = migrations[i];
    results.push('BEGIN');

    var sqls = m.up();
    for (var j = 0, n = sqls.length; j < n; ++j) {
      results.push(sqls[j].toSQL(this.adapter));
    }

    results.push(
      util.format('INSERT INTO schema_migrations VALUES (\'%s\')', m.version)
    );
    results.push('COMMIT');
  }
  results.push('SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1');

  return results;
}

FakeRunner.prototype.down = function(migrations) {
  var results = [];
  results.push('SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1');

  for (var i = migrations.length - 1; i >= 0; --i) {
    var m = migrations[i];
    results.push('BEGIN');

    var sqls = m.down();
    for (var j = 0, n = sqls.length; j < n; ++j) {
      results.push(sqls[j].toSQL(this.adapter));
    }

    results.push(
      util.format('DELETE FROM schema_migrations WHERE v=\'%s\'', m.version)
    );
    results.push('COMMIT');
  }
  results.push('SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1');

  return results;
}

function test(adapterName) {
  var runner, fakeRunner, migrations;

  before(function() {
    var app = {
      root: __dirname,
      config: {
        path: {
          db: {
            migrate: 'fixtures/migrate'
          }
        },
        database: {
          adapter: adapterName
        }
      }
    };

    app.adapter = adapter(app);

    runner = migrator(app);
    fakeRunner = new FakeRunner(app.adapter);

    app.adapter.connect = fakeRunner.db.connect.bind(fakeRunner.db);

    migrations = [
      '20130428112123-addUsers',
      '20130429101234-addPosts',
      '20130430100153-changePosts',
      '20130430100340-changeUsers'
    ];

    migrations = migrations.map(function(m) {
      var impl = require('./fixtures/migrate/' + m);
      return new Migration(m, impl);
    });
  });

  describe(adapterName, function() {
    describe('#migrate()', function() {
      it('should migrate to a specified version', function(done) {
        var expected = fakeRunner.up(migrations.slice(0,3));
        runner.migrate('20130430100153', function(err) {
          assert.equal(err, null, err);
          assert.deepEqual(fakeRunner.db.fetch(), expected);
          done();
        })
      });
      it('should migrate to a previous version', function(done) {
        var expected = fakeRunner.down(migrations.slice(2,3));
        runner.migrate('20130429101234', function(err) {
          assert.equal(err, null, err);
          assert.deepEqual(fakeRunner.db.fetch(), expected);
          //console.log(fakeRunner.db.fetch(), expected);
          done();
        })
      });
      it('should migrate to the latest version', function(done) {
        var expected = fakeRunner.up(migrations.slice(2));
        runner.migrate(undefined, function(err) {
          assert.equal(err, null, err);
          assert.deepEqual(fakeRunner.db.fetch(), expected);
          done();
        });
      });
    });

    describe('#rollback()', function() {
      it('should rollback one step', function(done) {
        var expected = fakeRunner.down(migrations.slice(3));
        runner.rollback(undefined, function(err) {
          assert.equal(err, null, err);
          assert.deepEqual(fakeRunner.db.fetch(), expected);
          done();
        });
      });
      it('should rollback to version 0', function(done) {
        var expected = fakeRunner.down(migrations.slice(0,3));
        runner.rollback(4, function(err) {
          assert.equal(err, null, err);
          assert.deepEqual(fakeRunner.db.fetch(), expected);
          done();
        });
      });
    });
  });
};

describe('migrator', function() {
  ['postgres', 'mysql'].forEach(function(name) {
    test(name);
  });
});
