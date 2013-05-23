var Generator = require(__dirname)
  , path = require('path')
  , util = require('util')

var MigrationGenerator = module.exports = function() {
  Generator.call(this);
}

util.inherits(MigrationGenerator, Generator);

MigrationGenerator.prototype.generate = function(name, version) {
  if (!version) version = require('moment')().format('YYYYMMDDHHmmss');

  var filename = version + '-' + name + '.js'
    , dir = require('../config').paths.db.migrate;
  this.mkdir(dir);
  this.cp(path.join(dir, filename), 'templates/migration.js');
};
