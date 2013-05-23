var assert = require('assert')
  , Generator = require('../lib/generator')
  , config = require('../lib/config')
  , path = require('path')
  , fs = require('fs')
  , moment = require('moment')
  , exec = require('child_process').exec;

describe('Generator', function() {
  before(function() {
    config.paths.root = '/tmp';
  });

  describe('AppGenerator', function() {
    var g;
   
    before(function() {
      g = Generator.make('app');
    });

    it('should generate a app structure', function() {
      var name = 'new-app'
        , dir = path.join(config.paths.root, name);
      g.generate(name);
      var files = fs.readdirSync(dir).sort();
      assert(files.length, 3);
      assert.deepEqual(files, ['Jakefile', 'config', 'db']);

      var jakefile = fs.readFileSync(path.join(dir, files[0]), 'utf8');
      assert(jakefile.indexOf("require('neutron');") > 0, true);

      assert(fs.statSync(path.join(dir, files[1])).isDirectory(), true);
      assert(require(path.join(dir, 'config/database.js'), {
        development: {
          adapter: 'postgres',
          database: 'new_app_development',
          user: 'new_app'
        },
        test: {
          adapter: 'postgres',
          database: 'new_app_test',
          user: 'new_app'
        },
        production: {
          adapter: 'postgres',
          database: 'new_app_production',
          user: 'new_app'
        }
      }));

      assert(fs.statSync(path.join(dir, files[2])).isDirectory(), true);
    });

    after(function(done) {
      exec('rm -rf /tmp/new-app', done);
    });
  });
  describe('MigrationGenerator', function() {
    var dir = '/tmp/db/migrate' , g;

    before(function() {
      g = Generator.make('migration')
    });

    it('should generate a migrate file', function() {
      g.generate('addUsers');
      var files = fs.readdirSync(dir);
      assert(files.length, 1);

      var filename = files[0]
        , version = filename.split('-')[0]
        , name = filename.split('-')[1];
      assert(version.slice(0, -3), moment().format('YYYYMMDDHHmmss'));
      assert(name, 'addUsers');

      var migration = require(path.join(dir, filename));
      assert(typeof migration, 'object');
      assert(migration.up, 'function');
      assert(migration.down, 'function');
    });

    it('should generate a migrate file with a specified version', function() {
      g.generate('addPosts', '12341213141516');
      var files = fs.readdirSync(dir);
      assert(files.length, 2);

      var filename = files[0]
        , version = filename.split('-')[0]
        , name = filename.split('-')[1];
      assert(version, '12341213141516');
      assert(name, 'addPosts');
    });

    after(function(done) {
      exec('rm -rf /tmp/db/migrate', done);
    });
  });
});
