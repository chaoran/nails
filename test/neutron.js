var assert = require('assert')
  , fs = require('fs')
  , exec = require('child_process').exec
  , colors = require('colors');

describe('neutron', function() {
  describe('new', function() {
    it('should generate an neutron application', function(done) {
      exec('neutron new /tmp/testapp', function(err, stdout, stderr) {
        assert.ok(!err, err);
        assert.ok(!stderr);
        assert.ok(fs.existsSync('/tmp/testapp'));
        assert.ok(fs.existsSync('/tmp/testapp/package.json'));
        assert.ok(fs.existsSync('/tmp/testapp/node_modules'));
        assert.ok(fs.existsSync('/tmp/testapp/node_modules/neutron'));
        assert.ok(require('/tmp/testapp/package.json'));
        done();
      });
    });
  });

  describe('use', function() {
    describe('use postgres', function() {
      it('should generate a postgres database config file', function(done) {
      });
    });
  });

  after(function(done) {
    exec('rm -rf /tmp/testapp', done);
  });
});
