var CreateTable = require('./node/createTable')
  , AlterTable = require('./node/alterTable')
  , RenameTable = require('./node/renameTable')
  , CreateIndex = require('./node/createIndex')
  , DropTable = require('./node/dropTable')
  , DropIndex = require('./node/dropIndex')

var Migration = module.exports = function(name, impl) {
  this.name = name;
  this.version = name.split('-')[0];
  this.up = function() {
    this.queries = [];
    impl.up.call(this);
    return this.queries;
  };
  this.down = function() {
    this.queries = [];
    impl.down.call(this);
    return this.queries;
  };
}

Migration.prototype = {
  createTable: function(name, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }

    var t = new CreateTable(name, options);
    callback(t);
    this.queries.push(t);
  },
  changeTable: function(name, callback) {
    var t = new AlterTable(name);
    callback(t);
    this.queries.push(t);
  },
  renameTable: function(name, new_name) {
    this.queries.push(new RenameTable(name, new_name));
  },
  dropTable: function(name) {
    this.queries.push(new DropTable(name));
  },
  addColumn: function(t_name, name, type, options) {
    var t = new AlterTable(t_name);
    t.column(name, type, options);
    this.queries.push(t);
  },
  changeColumn: function(t_name, name, type, options) {
    var t = new AlterTable(t_name);
    t.change(name, type, options);
    this.queries.push(t);
  },
  renameColumn: function(t_name, name, new_name) {
    var t = new AlterTable(t_name);
    t.rename(name, new_name);
    this.queries.push(t);
  },
  removeColumn: function(t_name, name) {
    var t = new AlterTable(t_name);
    t.remove(name);
    this.queries.push(t);
  },
  addIndex: function(t_name, columns, options) {
    var t = new CreateIndex(t_name, columns, options);
    this.queries.push(t);
  },
  removeIndex: function(t_name, columns, options) {
    var t = new DropIndex(t_name, columns, options);
    this.queries.push(t);
  }
}
