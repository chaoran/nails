var finish = require('finish')
  , path = require('path')
  , fs = require('fs')
  , Reporter = require('./reporter');

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
    dest = path.relative(process.cwd(), dest);
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
          finish.forEach(data, function(file, done) {
            that.copy(path.join(dest, file), path.join(src, file), done);
          }, callback);
        });
      else that.write(dest, data, callback);
    });
  },
  mkdir: function(dir, callback) {
    var that = this
      , reporter = new Reporter('create', dir);

    fs.mkdir(dir, reporter.report(function(err, callback) {
      switch (err.code) {
        case 'ENOENT': {
          that.mkdir(path.dirname(dir), function(err) {
            if (err) throw err;
            that.mkdir(dir, callback);
          });
        }; break;
        case 'EEXIST': {
          this.warn('exists');
        }; break;
        default: return err;
      }
    }, callback));
  },
  write: function(file, data, callback) {
    var that = this
      , reporter = new Reporter('create', file);

    fs.exists(file, reporter.report(function(exists, callback) {
      if (!exists) {
        this.cancel();
        return callback(null);
      }

      var that = this;

      fs.readFile(file, 'utf8', function(err, content) {
        console.log('read done');
        if (content == data) {
          that.message('identical');
        } else {
          that.warn('exists');
        }
        callback(null);
      });
    }, function() {
      fs.writeFile(file, data, reporter.report(function(err, callback) {
        if (err && err.code === 'ENOENT') {
          that.mkdir(path.dirname(file), function(err) {
            if (err) return callback(err);
            that.write(file, data, callback);
          });
        } else {
          callback(err);
        }
      }, callback));
    }));
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
