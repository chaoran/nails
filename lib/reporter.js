var colors = require('colors');

var Reporter = function(action, target) {
  this.time = process.hrtime();
  this.action = padding(action);
  this.target = target || '';
};

Reporter.prototype = {
  report: function(handler, callback) {
    var that = this;

    if (arguments.length === 1) {
      callback = handler;
      handler = undefined;
    }

    return function() {
      var err = handler? handler.apply(that, arguments) : arguments[0];

      if (err) that.error(err);
      else that.success();

      that.say();
      if (callback) callback.apply(global, arguments);
    }
  },
  say: function(err) {
    var time = process.hrtime(this.time);
    var ms = (time[0] * 1e3 + time[1] / 1e6).toFixed(0);

    ms = (' [' + ms + 'ms]').grey
    console.log(this.action + ': ' + this.target + ms);

    if (this.err) throw this.err;
  },
  success: function() {
    this.action = this.action.green;
  },
  warn: function(action) {
    this.action = padding(action).yellow;
  },
  message: function(action) {
    this.action = padding(action).blue;
  },
  error: function(err) {
    this.action = this.action.red;
    this.err = err;
  },
};

function padding(word) {
  if (word.length < 10) {
    return (new Array(11 - word.length)).join(' ') + word;
  } else throw new Error('string is too long: ' + word);
}

module.exports = Reporter;
