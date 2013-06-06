var assert = require('assert')
  , util = require('util')
  , Migrator = require('../lib/migration')
  , FakeAdapter = require('./helpers/fakeAdapter')

describe('migrator', function() {
  var migrator, schemas;

  before(function() {
    var app = {
      root: __dirname,
      config: {
        path: {
          db: {
            migrate: 'fixtures/migrate'
          }
        }
      }
    };

    app.adapter = new FakeAdapter({});

    migrator = Migrator(app);
    migrator.result = app.adapter.schemas;

    schemas = [
      '20130428112123',
      '20130429101234',
      '20130430100153',
      '20130430100340'
    ];
  });

  describe('#migrate()', function() {
    it('should migrate to a specified version', function(done) {
      migrator.migrate('20130430100153', function(err) {
        assert.equal(err, null, err);
        assert.deepEqual(migrator.result, schemas.slice(0,3));
        done();
      })
    });
    it('should migrate to a previous version', function(done) {
      migrator.migrate('20130429101234', function(err) {
        assert.equal(err, null, err);
        assert.deepEqual(migrator.result, schemas.slice(0,2));
        done();
      })
    });
    it('should migrate to the latest version', function(done) {
      migrator.migrate(undefined, function(err) {
        assert.equal(err, null, err);
        assert.deepEqual(migrator.result, schemas);
        done();
      });
    });
  });

  describe('#rollback()', function() {
    it('should rollback one step', function(done) {
      migrator.rollback(undefined, function(err) {
        assert.equal(err, null, err);
        assert.deepEqual(migrator.result, schemas.slice(0, 3));
        done();
      });
    });
    it('should rollback to version 0', function(done) {
      migrator.rollback(4, function(err) {
        assert.equal(err, null, err);
        assert.deepEqual(migrator.result, []);
        done();
      });
    });
  });
});

