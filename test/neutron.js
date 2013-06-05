var assert = require('assert')
  , fs = require('fs')
  , exec = require('child_process').exec
  , colors = require('colors');

describe('neutron', function() {
  describe('new', function() {
    it('should generate an neutron application', function(done) {
      exec('neutron new /tmp/testapp', function(err, stdout, stderr) {
        assert.ok(!err, err);
        assert.ok(!stderr, stderr);
        assert.ok(fs.existsSync('/tmp/testapp'));
        assert.ok(fs.existsSync('/tmp/testapp/package.json'));
        assert.ok(fs.existsSync('/tmp/testapp/node_modules'));
        assert.ok(fs.existsSync('/tmp/testapp/node_modules/neutron'));
        assert.ok(require('/tmp/testapp/package.json'));
        done();
      });
    });
  });

  describe('generate', function() {
    describe('migration', function() {
      it('should generate a migration', function(done) {
        exec(
          'cd /tmp/testapp && neutron generate migration test', 
          function(err, stdout, stderr) {
            assert(!err, err);
            assert(!stderr, stderr);
            assert(fs.existsSync('/tmp/testapp/db'));
            assert(fs.existsSync('/tmp/testapp/db/migrate'));
            var files = fs.readdirSync('/tmp/testapp/db/migrate');
            assert.equal(files.length, 1);
            var file = files[0]
            assert.equal(file.split('-')[1], 'test.js');
            assert.equal(file.split('-')[0].length, 14);
            assert.ok(require('/tmp/testapp/db/migrate/' + file));
            done();
          }
        );
      });
    });
  });

  after(function(done) {
    exec('rm -rf /tmp/testapp', done);
  });
});
