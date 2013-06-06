var Adapter = require('../../lib/adapter');
var assert = require('assert');

var FakeAdapter = module.exports = Adapter.extend(function(config) {
  this.Parser = function() {
    this.parse = function(t) { return t; };
  };
  this.schemas = [];
  this.logs = [];
  this.conns = [];
});

var FakeConnection = FakeAdapter.Connection = function(logs, schemas) { 
  this.logs = logs;
  this.schemas = schemas;
};

FakeConnection.prototype.query = function(q, callback) {
  this.logs.push(q);

  if (typeof q !== 'string') {
    if (callback) return callback(null);
    else return;
  }

  if (q.indexOf('SELECT v FROM schema_migrations') == 0) {
    if (this.schemas.length === 0) 
      return callback(new Error('does not exists'));
    else {
      var v = this.schemas[this.schemas.length - 1];
      return callback(null, [{ v: v }]);
    }
  }

  if (q.indexOf('INSERT INTO schema_migrations') == 0) {
    this.schemas.push(q.match(/[0-9]{14}/)[0]);
  }

  if (q.indexOf('DELETE FROM schema_migrations') == 0) {
    var v = q.match(/[0-9]{14}/)[0];
    var index = this.schemas.indexOf(v);
    this.schemas.splice(index, 1);
  }

  if (callback) callback(null);
};

FakeAdapter.prototype.connect = function(callback) {
  var conn = new FakeConnection(this.logs, this.schemas);
  this.conns.push(conn);
  callback(null, conn, function() { conn.released = true; });
};

FakeAdapter.prototype.close = function() {
  this.conns.forEach(function(conn) {
    assert.ok(conn.released);
  });
}
