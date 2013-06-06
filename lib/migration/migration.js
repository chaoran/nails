module.exports = function(adapter) {
  var Migration = function(name, impl) {
    var version = name.split('-')[0]
      , parser = require('./' + adapter.name)
      , Proxy = require('proxy');

    this.up = adapter.connected(function(conn, callback) {
      say.migrate(name);
      conn.begin();
      impl.up.call(new Proxy(conn, parser));
      conn.query("INSERT INTO schema_migrations VALUES ('" + version + "')");
      conn.commit(callback);
    });

    this.down = adapter.connected(function(conn, callback) {
      say.rollback(name);
      conn.begin();
      impl.down.call(new Proxy(conn, parser));
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
};
