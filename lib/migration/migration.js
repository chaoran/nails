var say = require('../say');

module.exports = function(adapter) {
  var Migration = function(name, impl) {
    var version = this.version = name.split('-')[0]

    this.up = adapter.connected(function(conn, callback) {
      say.migrate(name);
      conn.begin();

      this.connection = conn;
      var p = new (adapter.Parser)();
      this.parse = p.parse.bind(p);
      impl.up.call(this);

      conn.query("INSERT INTO schema_migrations VALUES ('" + version + "')");
      conn.commit(callback);
    });

    this.down = adapter.connected(function(conn, callback) {
      say.rollback(name);
      conn.begin();

      this.connection = conn;
      var p = new (adapter.Parser)();
      this.parse = p.parse.bind(p);
      impl.down.call(this);

      conn.query("DELETE FROM schema_migrations WHERE v='" + version + "'");
      conn.commit(callback);
    });
  };

  Migration.version = adapter.connected(function(conn, callback) {
    conn.query(
      'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      function(err, rows) {
        if (err) {
          if (err.message.indexOf('exist') < 0) return callback(err);
          return conn.query(
            'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
            function(err) { callback(err, 0); }
          );
        }
        callback(null, rows.length > 0? rows[0].v : 0);
      }
    );
  });

  Migration.prototype = {
    createTable: function(name, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = undefined;
      }

      var t = new (require('./node/createTable'))(name, options);
      callback(t);
      this.connection.query(this.parse(t));
    },
    changeTable: function(name, callback) {
      var t = new (require('./node/alterTable'))(name);
      callback(t);
      this.connection.query(this.parse(t));
    },
    renameTable: function(name, new_name) {
      var t = new (require('./node/renameTable'))(name, new_name);
      this.connection.query(this.parse(t));
    },
    dropTable: function(name) {
      var t = new (require('./node/dropTable'))(name);
      this.connection.query(this.parse(t));
    },
    addColumn: function(t_name, name, type, options) {
      var t = new (require('./node/alterTable'))(t_name);
      t.column(name, type, options);
      this.connection.query(this.parse(t));
    },
    changeColumn: function(t_name, name, type, options) {
      var t = new (require('./node/alterTable'))(t_name);
      t.change(name, type, options);
      this.connection.query(this.parse(t));
    },
    renameColumn: function(t_name, name, new_name) {
      var t = new (require('./node/alterTable'))(t_name);
      t.rename(name, new_name);
      this.connection.query(this.parse(t));
    },
    removeColumn: function(t_name, name) {
      var t = new (require('./node/alterTable'))(t_name);
      t.remove(name);
      this.connection.query(this.parse(t));
    },
    addIndex: function(t_name, columns, options) {
      var t = new (require('./node/createIndex'))(t_name, columns, options);
      this.connection.query(this.parse(t));
    },
    removeIndex: function(t_name, columns, options) {
      var t = new (require('./node/dropIndex'))(t_name, columns, options);
      this.connection.query(this.parse(t));
    }
  }
  return Migration;
};
