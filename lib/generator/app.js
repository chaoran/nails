var path = require('path')
  , Generator = require(__dirname)

var AppGenerator = module.exports = Generator.extend();

AppGenerator.prototype.generate = function(location, callback) {
  var package = JSON.stringify({
    name: path.basename(location),
    version: '0.0.0',
    author: process.env.USER,
  }, null, '  ');

  var that = this;

  this.write(path.join(location, 'package.json'), package, function(err) {
    if (err) return callback(err);
    that.run('cd ' + location + ' && npm link neutron', callback);
  });
};
