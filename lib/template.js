var say = require('./say')
  , finish = require('finish')
  , path = require('path')
  , fs = require('fs')

var Template = module.exports = function(src) {
  this.source = path.join(__dirname, src);
  this.mapping = {};
  this.variables = {};
}

Template.prototype = {
  map: function(from, to) {
    from = path.join(this.source, from);
    to = path.join(this.source, to);
    this.mapping[from] = to;
  },
  set: function(name, value) {
    this.variables[name] = value;
  },
  instantiate: function(dest, callback) {
    this.copy(dest, this.source, callback);
  },
  copy: function(dest, src, callback) {
    var that = this;
    this.preprocess(src, function(err, data) {
      if (err) return callback(err);
      if (!data) return callback(null);

      if (data instanceof Array) 
        that.mkdir(dest, function(err) {
          if (err) return callback(err);
          finish.forEach(data, function(async, file) {
            async(function(done) {
              that.copy(path.join(dest, file), path.join(src, file), done);
            });
          }, callback);
        });
      else that.write(dest, data, callback);
    });
  },
  mkdir: function(dir, callback) {
    var that = this;
    fs.mkdir(dir, function(err) {
      if (err) {
        switch (err.code) {
          case 'ENOENT': return that.mkdir(path.dirname(dir), function(err) {
            if (err) throw err;
            that.mkdir(dir, callback);
          });
          case 'EEXIST': {
            say.exists(dir);
            return callback(null);
          }
          default: throw err;
        }
      }
      say.create(dir);
      callback(null);
    });
  },
  write: function(file, data, callback) {
    var that = this;
    fs.exists(file, function(exists) {
      if (exists) {
        return fs.readFile(file, 'utf8', function(err, content) {
          if (content == data) {
            say.identical(file);
          } else {
            say.exists(file);
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
        say.create(file);
        callback(null);
      });
    });
  },
  preprocess: function(src, callback) {
    var that = this;
    fs.readFile(src, 'utf8', function(err, data) {
      if (err) {
        if (err.code === 'EISDIR') {
          if (that.mapping[src]) that.preprocess(that.mapping[src], callback);
          else fs.readdir(src, callback);
        }
        else callback(err);
        return;
      }
      for (var key in that.variables) {
        var regExp = new RegExp("\\%\\{" + key + "\\}", "g");
        data = data.replace(regExp, that.variables[key]);
      }
      callback(null, data);
    });
  }
}
