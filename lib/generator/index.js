var config = require('../config')
  , path = require('path')
  , fs = require('fs')
  , colors = require('colors')

var Generator = module.exports = function() {
  this.dir = config.paths.root;
};

Generator.make = function(entity) {
  switch (entity) {
    case 'app': return new (require('./app'))();
    case 'migration': return new (require('./migration'))();
    default: throw new Error('unrecognized generator: ' + entity);
  }
}

Generator.prototype.mkdir = function(dir) {
  require('mkdirp').sync(path.join(this.dir, dir));
};

Generator.prototype.cp = function(dest, src, preprocess) {
  var self = this
    , abs_src = path.join(__dirname, src)
    , stat = fs.statSync(abs_src);

  if (preprocess) {
    var data = preprocess(abs_src);
    if (data) {
      fs.writeFileSync(path.join(this.dir, dest), data);
      console.log('\tcreate'.green, dest);
      return;
    }
  }

  if (stat.isFile()) {
    fs.writeFileSync(path.join(this.dir, dest), fs.readFileSync(abs_src));
    console.log('\tcreate'.green, dest);
  } else if (stat.isDirectory()) {
    self.mkdir(dest);
    console.log('\tcreate'.green, dest);

    var files = fs.readdirSync(abs_src);
    for (var i = 0, l = files.length; i < l; ++i) {
      var file = files[i];
      this.cp(path.join(dest, file), path.join(src, file), preprocess);
    }
  }
};
