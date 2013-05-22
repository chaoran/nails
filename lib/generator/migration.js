var Generator = require(__dirname)
  , moment = require('moment')
  , config = require('../config')
  , util = require('util')

var MigrationGenerator = module.exports = function() {
  Generator.call(this);
  Generator.prototype.cd.call(this, config.paths.db.migrate);
}

util.inherits(MigrationGenerator, Generator);

MigrationGenerator.prototype.generate = function(name, version) {
  if (!version) version = moment().format('YYYYMMDDHHmmss');

  var filename = version + '-' + name + '.js';
  this.mkdir();
  this.cp(filename, 'templates/migration.js');
};
