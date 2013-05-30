var report = require('../report')
  , path = require('path')
  , fs = require('fs')
  , util = require('util')
  , exec = require('child_process').exec
  , finish = require('finish')

var Generator = module.exports = require('../factory')();

Generator.prototype.cp = function(dest, src, callback) {
  var that = this;
  this.filter(src, function(err, data) {
    if (err) return callback(err);
    if (!data) return callback(null);

    if (data instanceof Array) finish.forEach(data, function(async, file) {
      async(function(done) {
        that.cp(path.join(dest, file), path.join(src, file), done);
      });
    }, callback);
    else that.write(dest, data, callback);
  });
};

Generator.prototype.mkdir = function(dir, callback) {
  var that = this;
  fs.mkdir(dir, function(err) {
    if (err) {
      switch (err.code) {
        case 'ENOENT': return that.mkdir(path.dirname(dir), function(err) {
          if (err) throw err;
          that.mkdir(dir, callback);
        });
        case 'EEXIST': {
          report.exists(dir);
          return callback(null);
        }
        default: throw err;
      }
    }
    report.create(dir);
    callback(null);
  });
};

Generator.prototype.write = function(file, data, callback) {
  var that = this;
  fs.exists(file, function(exists) {
    if (exists) {
      return fs.readFile(file, 'utf8', function(err, content) {
        if (content == data) {
          report.identical(file);
        } else {
          report.exists(file);
        }
        return callback(null);
      });
    }

    fs.writeFile(file, data, function(err) {
      if (err) {
        if (err.code === 'ENOENT') {
          return that.mkdir(path.dirname(file), function(err) {
            if (err) return callback(err);
            that.write(file, data, callback);
          });
        }
        return callback(err);
      }
      report.create(file);
      callback(null);
    });
  });
};

Generator.prototype.run = function(command, callback) {
  exec(command, function(err) {
    if (err) return report.fatal('running command: %s', err.message);
    report.run(command);
    callback(null);
  });
};

Generator.prototype.filter = function(src, callback) {
  fs.readFile(src, function(err, data) {
    if (err) {
      if (err.code === 'EISDIR') fs.readdir(src, callback);
      else callback(err);
    }
    callback(null, data);
  });
};
