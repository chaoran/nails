var sql = {
  last: 'SELECT * FROM schema_migrations ORDER BY v DESC LIMIT ?', 
  insert: 'INSERT INTO schema_migrations (v) VALUES (?)', 
  remove: 'DELETE FROM schema_migrations WHERE v=?',
  create: 'CREATE TABLE schema_migrations (v CHAR(14) UNIQUE)'
};

var schema = module.exports = {
  last: function(conn, limit, callback) {
    conn.query(sql.last, [ limit ], function(err, rows) {
      if (err) {
        if (err.message.indexOf('exist') < 0) callback(err);
        else conn.query(sql.create, function(err) {
          callback(err, [ '0' ]);
        });
      } else callback(null, rows.map(function(row) { return row.v; }));
    });
  },
  insert: function(conn, v) {
    conn.query(sql.insert, [ v ]);
  },
  remove: function(conn, v) {
    conn.query(sql.remove , [ v ]);
  }
};
