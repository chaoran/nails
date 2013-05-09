var assert = require('assert')
  , config = require('../lib/config')
  , CreateTable = require('../lib/node/createTable')
  , AlterTable = require('../lib/node/alterTable') 
  , RenameTable = require('../lib/node/RenameTable') 
  , DropTable = require('../lib/node/DropTable')
  , CreateIndex = require('../lib/node/CreateIndex')
  , DropIndex = require('../lib/node/DropIndex')
  , Adapter = require('../lib/adapter')

config.database = { };

function test(adapterName) {
  var adapter = Adapter.make({
    adapter: adapterName
  });

  describe(adapterName, function() {
    describe('CreateTable', function() {
      var sql = {
        postgres: 'CREATE TABLE "table" ('
        + '"id" BIGSERIAL PRIMARY KEY, '
        + '"binary" BYTEA NOT NULL, '
        + '"boolean" BOOLEAN DEFAULT \'true\', '
        + '"date" DATE, '
        + '"datetime" TIMESTAMP, '
        + '"decimal" DECIMAL(10,2), '
        + '"float" FLOAT, '
        + '"integer" INTEGER(8), '
        + '"string" VARCHAR(255), ' 
        + '"text" TEXT, '
        + '"time" TIME, '
        + '"timestamp" TIMESTAMP'
        + ')',
        mysql: 'CREATE TABLE `table` ('
        + '`id` SERIAL PRIMARY KEY, '
        + '`binary` BLOB NOT NULL, '
        + '`boolean` TINYINT(1) DEFAULT \'true\', '
        + '`date` DATE, '
        + '`datetime` DATETIME, '
        + '`decimal` DECIMAL(10,2), '
        + '`float` FLOAT, '
        + '`integer` INT(8), '
        + '`string` VARCHAR(255), ' 
        + '`text` TEXT, '
        + '`time` TIME, '
        + '`timestamp` DATETIME'
        + ')'
      };

      it('should generate CREATE TABLE statement', function() {
        var t = new CreateTable('table');
        t.primaryKey('id');
        t.binary('binary', { null: false });
        t.boolean('boolean', { default: true });
        t.date('date');
        t.datetime('datetime');
        t.decimal('decimal', { precision: 10, scale: 2 });
        t.float('float');
        t.integer('integer', { limit: 8 });
        t.string('string');
        t.text('text');
        t.time('time');
        t.timestamp('timestamp');
        assert.equal(t.toSQL(adapter), sql[adapterName]);
      });
    });

    describe('AlterTable', function() {
      describe('#column()', function() {
        var sql = {
          postgres: 'ALTER TABLE "people" '
          + 'ADD "name" VARCHAR(255) DEFAULT \'john\' NOT NULL',
          mysql: 'ALTER TABLE `people` ' 
          + 'ADD `name` VARCHAR(255) DEFAULT \'john\' NOT NULL'
        };

        it('should generate ADD COLUMN statement', function() {
          var t = new AlterTable('people');
          t.string('name', { null: false, default: 'john' });
          assert.equal(t.toSQL(adapter), sql[adapterName]);
        });
      });
      describe('#rename()', function() {
        var sql = {
          postgres: 'ALTER TABLE "people" RENAME "name" TO "username"',
          mysql: 'ALTER TABLE `people` RENAME `name` TO `username`'
        };

        it('should generate RENAME COLUMN statement', function() {
          var t = new AlterTable('people');
          t.rename('name', 'username');
          assert.equal(t.toSQL(adapter), sql[adapterName]);
        });   
      });
      describe('#change()', function() {
        var sql = {
          postgres: 'ALTER TABLE "table" ALTER "drop" TYPE VARCHAR(255),'
          + ' ALTER "drop" DROP DEFAULT, ALTER "drop" SET NULL',
          mysql: 'ALTER TABLE `table` MODIFY `drop` VARCHAR(255)'
        };

        it('should generate ALTER COLUMN statement', function() {
          var t = new AlterTable('table');
          t.change('drop', 'string', { default: null, null: true });
          assert.equal(t.toSQL(adapter), sql[adapterName]);
        });
      });
      describe('#remove()', function() {
        var sql = {
          postgres: 'ALTER TABLE "people" DROP "avatar"',
          mysql: 'ALTER TABLE `people` DROP `avatar`'
        };

        it('should generate DROP COLUMN statement', function() {
          var t = new AlterTable('people');
          t.remove('avatar');
          assert.equal(t.toSQL(adapter), sql[adapterName]);
        });
      });
    });

    describe('RenameTable', function() {
      var sql = {
        postgres: 'ALTER TABLE "people" RENAME TO "users"',
        mysql: 'ALTER TABLE `people` RENAME TO `users`'
      };

      it('should generate ALTER TABLE RENAME TO statement', function() {
        var t = new RenameTable('people', 'users');
        assert.equal(t.toSQL(adapter), sql[adapterName]);
      });
    });

    describe('DropTable', function() {
      var sql = {
        postgres: 'DROP TABLE "people"',
        mysql: 'DROP TABLE `people`'
      };

      it('should generate DROP TABLE statement', function() {
        var t = new DropTable('people');
        assert.equal(t.toSQL(adapter), sql[adapterName]);
      });
    });

    describe('CreateIndex', function() {
      var sql = {
        postgres: 'CREATE UNIQUE INDEX "user_username_password_idx" ON "user"'
        + ' ("username", "password")',
        mysql: 'CREATE UNIQUE INDEX `user_username_password_idx` ON `user`'
        + ' (`username`, `password`)'
      };

      it('should generate CREATE INDEX statement', function() {
        var t = new CreateIndex('user', ['username', 'password'], { 
          unique: true 
        });
        assert.equal(t.toSQL(adapter), sql[adapterName]);
      });
    });

    describe('DropIndex', function() {
      var sql = {
        postgres: 'DROP INDEX "user_username_password_idx"',
        mysql: 'DROP INDEX `user_username_password_idx` ON `user`'
      };

      it('should generate DROP INDEX statement', function() {
        var t = new DropIndex('user', ['username', 'password']);
        assert.equal(t.toSQL(adapter), sql[adapterName]);
      });
    });
  });
}

describe('Node', function() {
  ['postgres', 'mysql'].forEach(function(name) {
    test(name);
  });
});

