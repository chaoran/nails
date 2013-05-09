var assert = require('assert')
  , Generator = require('../lib/generator')
  , config = require('../lib/config')
  , path = require('path')
  , fs = require('fs')
  , moment = require('moment')

describe('Generator', function() {
  describe('MigrationGenerator', function() {
    var dir = '/tmp/migrate';
    var g;

    before(function() {
      config.paths.root = '/tmp';
      config.paths.db.migrate = 'migrate';
      config.package = { version: "2.7.8" };
      g = Generator.make('migration');
    });

    it('should generate a migrate file', function() {
      g.generate('addUsers');

      var files = fs.readdirSync(dir);
      assert(files.length, 1);

      var filename = files[0]
        , version = filename.split('-')[0]
        , name = filename.split('-')[1];
      assert(version.slice(0, -3), moment().format('278YYYYMMDDHHmmss'));
      assert(name, 'addUsers');

      var migration = require(path.join(dir, filename));
      assert(typeof migration, 'object');
      assert(migration.up, 'function');
      assert(migration.down, 'function');
    });

    it('should generate a migrate file with a specified version', function() {
      g.generate('addPosts', '123456');
      var files = fs.readdirSync(dir);
      assert(files.length, 2);

      var filename = files[0]
        , version = filename.split('-')[0]
        , name = filename.split('-')[1];
      assert(version, '123456');
      assert(name, 'addPosts');
    });

    after(function() {
      var dir = '/tmp/migrate'
        , files = fs.readdirSync(dir);

      files.forEach(function(file) { 
        fs.unlinkSync(path.join(dir, file)) 
      });
      fs.rmdirSync(dir);
    });
  });
});
