var path = require('path');

var Migration = module.exports = function(filepath) {
  var filename = path.basename(filepath, '.js')
    , migration = require(filepath);

  this.name = filename;
  this.version = filename.split('-')[0];

  for (var verb in migration) {
    this[verb] = (function(verb) {
      return function() {
        this.queries = [];
        migration[verb].call(this);

        return this.queries;
      };
    })(verb);
  }
};

Migration.prototype = {
  createTable: function(name, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    var t = new (require('./sql/createTable'))(name, options);
    callback(t);
    this.queries.push(t);
  },
  changeTable: function(name, callback) {
    var t = new (require('./sql/alterTable'))(name);
    callback(t);
    this.queries.push(t);
  },
  renameTable: function(name, new_name) {
    var t = new (require('./sql/renameTable'))(name, new_name);
    this.queries.push(t);
  },
  dropTable: function(name) {
    var t = new (require('./sql/DropTable'))(name);
    this.queries.push(t);
  },
  addColumn: function(t_name, name, type, options) {
    var t = new (require('./sql/alterTable'))(t_name);
    t.column(name, type, options);
    this.queries.push(t);
  },
  changeColumn: function(t_name, name, type, options) {
    var t = new (require('./sql/alterTable'))(t_name);
    t.change(name, type, options);
    this.queries.push(t);
  },
  renameColumn: function(t_name, name, new_name) {
    var t = new (require('./sql/alterTable'))(t_name);
    t.rename(name, new_name);
    this.queries.push(t);
  },
  removeColumn: function(t_name, name) {
    var t = new (require('./sql/alterTable'))(t_name);
    t.remove(name);
    this.queries.push(t);
  },
  addIndex: function(t_name, columns, options) {
    var t = new (require('./sql/createIndex'))(t_name, columns, options);
    this.queries.push(t);
  },
  removeIndex: function(t_name, columns, options) {
    var t = new (require('./sql/dropIndex'))(t_name, columns, options);
    this.queries.push(t);
  }
}
