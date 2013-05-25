var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , Generator = require(__dirname)

var AppGenerator = module.exports = function() {
  Generator.call(this);
}

util.inherits(AppGenerator, Generator);

AppGenerator.prototype.generate = function(name) {
  var options = require('optimist').default({
    d: 'postgres',
    database: 'postgres'
  }).parse(Array.prototype.slice(arguments));

  options.database = options.d || options.database || 'postgres';

  this.cp(name, 'templates/app', function(src) {
    switch (path.basename(src)) {
      case 'database.js': 
        src = path.join(src, options.database + '.js'); 
      case 'package.json': {
        var data = fs.readFileSync(src, 'utf8');
        return data.replace(/\%\{app_name\}/g, name.replace(/-/g, '_'));
      }
      default: return null;
    }
  });
};
