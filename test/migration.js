var assert = require('assert')
  , Migration = require('../lib/migration')

describe('Migration', function() {
  var migration = new Migration('00012341231112233123-test', {
    up: function() {
      this.createTable('table', function(t) {
        t.string('username', { null: false });
        t.timestamp('created_at', { default: 'now()' });
      });
      this.changeTable('table', function(t) {
        t.string('password', { limit: 20 });
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

  it('should have version and name', function() {
    assert.equal(typeof migration.version, 'string');
    assert.equal(migration.version, '00012341231112233123');
    assert.equal(migration.name, '00012341231112233123-test');
  });

  describe('#up()', function() {
    var sqls = migration.up();
    it('should have a CreateTable node', function() {
      var node = sqls[0];
      assert.equal(node.type, 'CreateTable');
      assert.equal(node.name, 'table');
      assert.equal(node.children.length, 2);
      
      var n1 = node.children[0];
      assert.equal(n1.type, 'DefineColumn');
      assert.equal(n1.name, 'username');
      assert.equal(n1.dbType.name, 'string');
      assert.equal(n1.notNull, true);

      var n2 = node.children[1];
      assert.equal(n2.type, 'DefineColumn');
      assert.equal(n2.name, 'created_at');
      assert.equal(n2.dbType.name, 'timestamp');
      assert.equal(n2.defaultValue, 'now()');
    });

    it('should have a AlterTable node', function() {
      var node = sqls[1];
      assert.equal(node.type, 'AlterTable');
      assert.equal(node.name, 'table');
      assert.equal(node.children.length, 4);

      var n1 = node.children[0];
      assert.equal(n1.type, 'AddColumn');
      assert.equal(n1.name, 'password');
      assert.equal(n1.dbType.name, 'string');
      assert.equal(n1.dbType.limit, 20);

      var n2 = node.children[1];
      assert.equal(n2.type, 'DropColumn');
      assert.equal(n2.name, 'created_at');

      var n3 = node.children[2];
      assert.equal(n3.type, 'AlterColumn');
      assert.equal(n3.name, 'username');
      assert.equal(n3.notNull, false);
      assert.equal(n3.dbType.name, 'string');
      assert.equal(n3.dbType.limit, 50);

      var n4 = node.children[3];
      assert.equal(n4.type, 'RenameColumn');
      assert.equal(n4.name, 'created_at');
      assert.equal(n4.newName, 'registered_at');
    });

    it('should have a RenameTable node', function() {
      var node = sqls[2];
      assert.equal(node.type, 'RenameTable');
      assert.equal(node.name, 'table');
      assert.equal(node.newName, 'new-table');
    });

    it('should have a CreateIndex node', function() {
      var node = sqls[3];
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
  });

  describe('#down()', function() {
    var sqls = migration.down();

    it('should have a DropIndex node', function() {
      var node = sqls[0];
      assert.equal(node.type, 'DropIndex');
      assert.equal(node.table, 'table');
      assert.equal(node.name, 'table_username_password_idx');
    });

    it('should have a DropTable node', function() {
      var node = sqls[1];
      assert.equal(node.type, 'DropTable');
      assert.equal(node.name, 'new-table');
    });
  });
});
