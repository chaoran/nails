var fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , config = require('../config')
  , optimist = require('optimist')
  , colors = require('colors')

module.exports = (function() {
  var base = process.cwd()
    , options;

  function copyDirectory(dest, dir, callback) {
    switch (path.basename(dir)) {
      case 'databases': {
        file = path.join(dir, options.database + '.js'); 
        dest = path.join(dest, 'database.js');
        return copyFile(dest, file, callback);
      }
    }

    var files = fs.readDirSync(dir)
      , target = path.join(dest, path.basename(dir));

    if (!fs.existsSync(target)) fs.mkdirSync(target, 755);

    for (var i = 0, l = files.length; i < l; ++i) {
      var filepath = path.join(dir, files[i]);

      fs.lstat(filepath, function(err, stat) {
        if (err) throw err;
        if (stat.isFile()) {
          copyFile(path.join(target, files[i]), filepath, callback);
        } else if (stat.isDirectory()) {
          copyDirectory(target, filepath, callback);
        }
      });
    }
  }

  function copyFile(dest, src, callback) {
    fs.readFile(src, { encoding: 'utf8' }, function(err, data) {
      data.replace(/\%\{app_name\}/g, config.app.name);
      var relPath = path.relative(base, dest);

      if (fs.existsSync(dest)) {
        return console.log('exists '.yellow, relPath);
      }

      fs.writeFile(dest, data, function(err) {
        if (err) throw err;
        console.log('created'.green, relPath);
      });
    });
  }

  return function(name) {
    options = optimist.parse(Array.prototype.slice(arguments))
    copyDirectory(dir, path.join(__dirname, 'templates/app'));
  }
})();

