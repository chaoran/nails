var assert = require('assert')
  , FakeAdapter = require('./helpers/fakeAdapter')

describe('Migration', function() {
  var migration, adapter;

  adapter = new FakeAdapter({})
  var Migration = require('../lib/migrator/migration')(adapter);

  migration = new Migration('12341231112233-test', {
    up: function() {
      this.createTable('table', function(t) {
        t.string('username', { null: false });
        t.references('account', { null: false });
        t.timestamp('created_at', { default: 'now()' });
      });
      this.changeTable('table', function(t) {
        t.string('password', { limit: 20 });
        t.references('owner');
        t.remove('created_at');
        t.change('username', 'string', { limit: 50, null: true });
        t.rename('created_at', 'registered_at');
      });
      this.renameTable('table', 'new-table');
      this.addIndex('table', ['username', 'password'], { 
        unique: true, order: { username: 'DESC' } 
      });
    },
    down: function() {
      this.removeIndex('table', ['username', 'password']);
      this.dropTable('new-table');
    }
  });

  it('should have a version', function() {
    assert.equal(typeof migration.version, 'string');
    assert.equal(migration.version, '12341231112233');
  });

  describe('#up()', function() {
    var logs;

    before(function(done) {
      migration.up(done);
      logs = adapter.logs;
    });

    it('should first begin a transaction', function() {
      var string = logs.shift();
      assert.equal(string, 'BEGIN');
    });

    it('should have a CreateTable node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'CreateTable');
      assert.equal(node.name, 'table');
      assert.equal(node.children.length, 4);

      var n0 = node.children[0];
      assert.equal(n0.type, 'DefineColumn');
      assert.equal(n0.name, 'id');
      assert.equal(n0.dbType.name, 'primaryKey');
      
      var n1 = node.children[1];
      assert.equal(n1.type, 'DefineColumn');
      assert.equal(n1.name, 'username');
      assert.equal(n1.dbType.name, 'string');
      assert.equal(n1.notNull, true);

      var n2 = node.children[2];
      assert.equal(n2.type, 'DefineColumn');
      assert.equal(n2.name, 'account_id');
      assert.equal(n2.dbType.name, 'id');
      assert.equal(n2.notNull, true);

      var n3 = node.children[3];
      assert.equal(n3.type, 'DefineColumn');
      assert.equal(n3.name, 'created_at');
      assert.equal(n3.dbType.name, 'timestamp');
      assert.equal(n3.defaultValue, 'now()');
    });

    it('should have a AlterTable node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'AlterTable');
      assert.equal(node.name, 'table');
      assert.equal(node.children.length, 5);

      var n1 = node.children[0];
      assert.equal(n1.type, 'AddColumn');
      assert.equal(n1.name, 'password');
      assert.equal(n1.dbType.name, 'string');
      assert.equal(n1.dbType.limit, 20);

      var n2 = node.children[1];
      assert.equal(n2.type, 'AddColumn');
      assert.equal(n2.name, 'owner_id');
      assert.equal(n2.dbType.name, 'id');

      var n3 = node.children[2];
      assert.equal(n3.type, 'DropColumn');
      assert.equal(n3.name, 'created_at');

      var n4 = node.children[3];
      assert.equal(n4.type, 'AlterColumn');
      assert.equal(n4.name, 'username');
      assert.equal(n4.notNull, false);
      assert.equal(n4.dbType.name, 'string');
      assert.equal(n4.dbType.limit, 50);

      var n5 = node.children[4];
      assert.equal(n5.type, 'RenameColumn');
      assert.equal(n5.name, 'created_at');
      assert.equal(n5.newName, 'registered_at');
    });

    it('should have a RenameTable node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'RenameTable');
      assert.equal(node.name, 'table');
      assert.equal(node.newName, 'new-table');
    });

    it('should have a CreateIndex node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'CreateIndex');
      assert.equal(node.table, 'table');
      assert.equal(node.name, 'table_username_password_idx');
      assert.equal(node.unique, true);
      assert.equal(node.columns.length, 2);
      assert.equal(node.columns[0].name, 'username');
      assert.equal(node.columns[0].order, 'DESC');
      assert.equal(node.columns[1].name, 'password');
      assert.equal(node.columns[1].order, undefined);
    });

    it('should insert schema version', function() {
      var string = logs.shift();
      assert.equal(
        string, 
        "INSERT INTO schema_migrations VALUES ('12341231112233')"
      );
    });

    it('should execute COMMIT', function() {
      var string = logs.shift();
      assert.equal(string, 'COMMIT');
    });
  });

  describe('#down()', function() {
    var logs;

    before(function(done) {
      migration.down(done);
      logs = adapter.logs;
    });

    it('should first begin a transaction', function() {
      var string = logs.shift();
      assert.equal(string, 'BEGIN');
    });

    it('should have a DropIndex node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'DropIndex');
      assert.equal(node.table, 'table');
      assert.equal(node.name, 'table_username_password_idx');
    });

    it('should have a DropTable node', function() {
      var node = logs.shift();
      assert.equal(node.type, 'DropTable');
      assert.equal(node.name, 'new-table');
    });

    it('should insert schema version', function() {
      var string = logs.shift();
      assert.equal(
        string, 
        "DELETE FROM schema_migrations WHERE v='12341231112233'"
      );
    });

    it('should execute COMMIT', function() {
      var string = logs.shift();
      assert.equal(string, 'COMMIT');
    });
  });
});
