var config = require('../config')
  , path = require('path')
  , fs = require('fs')
  , mkdirp = require('mkdirp')

var Generator = module.exports = function() {
  this.dir = config.paths.root;
};

Generator.make = function(entity) {
  switch (entity) {
    case 'app': return new (require('./app'))();
    case 'migration': return new (require('./migration'))();
    default: throw new Error('unrecognized generator: ', entity);
  }
}

Generator.prototype.cd = function(dir) {
  this.dir = path.resolve(this.dir, dir);
};

Generator.prototype.mkdir = function(dir) {
  mkdirp.sync(dir || this.dir);
};

Generator.prototype.cp = function(dest, src) {
  var abs_src = path.join(__dirname, src)
    , abs_dest = path.join(this.dir, dest)
    , stat = fs.lstatSync(abs_src);

  if (stat.isFile()) {
    fs.writeFileSync(abs_dest, fs.readFileSync(abs_src));
  } else if (stat.isDirectory()) {
    self.mkdir(dest);
    var files = fs.readdirSync(src);
    for (var i = 0, l = files.length; i < l; ++i) {
      this.cp(path.join(dest, files[i]), path.join(src, files[i]))
    }
  }
};
