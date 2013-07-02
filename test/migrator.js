var assert = require('assert')
  , path = require('path')
  , SandboxedModule = require('sandboxed-module')
  , nm = require('nodemock')
  , conn;

var fs = { 
  readdirSync: function(dir) { 
    assert(dir, '/tmp/db/migrate');
    return [ '1-test1', '2-test2', '3-test3', '4-test4' ];
  }
}

var schema = {
  db: [],
  last: function(conn, limit, callback) {
    var ret = this.db.slice(0, limit);
    if (ret.length === 0) ret.push('0');
    callback(null, ret);
  },
  insert: function(conn, v, callback) {
    this.db.unshift(v);
    if (callback) callback(null);
  },
  remove: function(conn, v, callback) {
    assert.equal(this.db.shift(), v)
    if (callback) callback(null);
  }
}

var Migration = function(name) {
  name = path.basename(name);
  this.version = name.split('-')[0];
  this.up = function() { 
    return [name + 'up'];
  };
  this.down = function() { 
    return [name + 'down'];
  };
};

var Parser = function() {
  return { visit: function(x) { return x } };
};

var Reporter = function(action, target) {
  this.report = function(handler, callback) {
    if (arguments.length < 2) {
      callback = handler;
    }

    return function() {
      callback.apply(global, arguments);
    }
  };
};

var Adapter = function(config) {
  assert.equal(config.adapter, 'fake');
  return {
    connected: function(func) { 
      return function() { 
        var args = [].slice.call(arguments);
        args.unshift(conn);
        func.apply(this, args) 
      };
    }
  }
}

var app = {
  root: '/tmp',
  path: {
    db: {
      migrate: 'db/migrate'
    }
  },
  config: {
    database: {
      adapter: 'fake'
    }
  }
};

var Migrator = SandboxedModule.require('../lib/migrator', {
  requires: { 
    'fs': fs,
    '../adapter': Adapter,
    './migration': Migration,
    './parser': Parser,
    './schema': schema,
    '../reporter': Reporter
  }
});

var m = new Migrator(app);

describe('migrator', function() {
  describe('#migrate()', function() {
    it('should migrate to a specific version', function(done) {
      schema.db = ['2', '1'];

      conn = nm.mock('begin').takes().times(2);
      conn.mock('query').takes('3-test3up');
      conn.mock('query').takes('4-test4up');
      conn.mock('commit').takes(function() {}).calls(0, [ null ]).times(2);

      m.migrate('4', function(err) {
        conn.assertThrows();
        assert(!err);
        assert.deepEqual(schema.db, ['4', '3', '2', '1']);
        done();
      });
    });

    it('should migrate to latest version', function(done) {
      schema.db = [];

      conn = nm.mock('begin').takes().times(4);
      conn.mock('query').takes('1-test1up');
      conn.mock('query').takes('2-test2up');
      conn.mock('query').takes('3-test3up');
      conn.mock('query').takes('4-test4up');
      conn.mock('commit').takes(function() {}).calls(0, [ null ]).times(4);

      m.migrate('5', function(err) {
        conn.assertThrows();
        assert(!err);
        assert.deepEqual(schema.db, ['4', '3', '2', '1']);
        done();
      });
    });

    it('should migrate to a previous version', function(done) {
      schema.db = ['4', '3', '2', '1'];

      conn = nm.mock('begin').takes().times(2);
      conn.mock('query').takes('4-test4down');
      conn.mock('query').takes('3-test3down');
      conn.mock('commit').takes(function() {}).calls(0, [ null ]).times(2);

      m.migrate('2', function(err) {
        conn.assertThrows();
        assert(!err);
        assert.deepEqual(schema.db, ['2', '1']);
        done();
      });
    });
  });

  describe('#rollback()', function() {
    it('should rollback n steps', function(done) {
      schema.db = ['4', '3', '2', '1'];

      conn = nm.mock('begin').takes().times(2);
      conn.mock('query').takes('4-test4down');
      conn.mock('query').takes('3-test3down');
      conn.mock('commit').takes(function() {}).calls(0, [ null ]).times(2);

      m.rollback(2, function(err) {
        conn.assertThrows();
        assert(!err);
        assert.deepEqual(schema.db, ['2', '1']);
        done();
      });
    });

    it('should rollback all', function(done) {
      schema.db = ['4', '3', '2', '1'];

      conn = nm.mock('begin').takes().times(4);
      conn.mock('query').takes('4-test4down');
      conn.mock('query').takes('3-test3down');
      conn.mock('query').takes('2-test2down');
      conn.mock('query').takes('1-test1down');
      conn.mock('commit').takes(function() {}).calls(0, [ null ]).times(4);

      m.rollback(5, function(err) {
        conn.assertThrows();
        assert(!err);
        assert.deepEqual(schema.db, []);
        done();
      });
    });
  });

  describe('#version()', function() {
    it('should retrive current version', function(done) {
      schema.db = ['3', '2', '1'];

      m.version(function(err, version) {
        assert(!err);
        assert.equal(version, '3');
        done();
      });
    });

    it('should return 0 if no schemas', function(done) {
      schema.db = [];

      m.version(function(err, version) {
        assert(!err);
        assert.equal(version, '0');
        done();
      });
    });
  });
});
