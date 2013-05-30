var colors = require('colors')
  , util = require('util')

module.exports = {
  create: function() {
    console.log('   create:'.green, util.format.apply(util, arguments));
  },
  identical: function() {
    console.log('identical:'.blue, util.format.apply(util, arguments));
  },
  exists: function() {
    console.log('   exists:'.yellow, util.format.apply(util, arguments));
  },
  run: function() {
    console.log('      run:'.green, util.format.apply(util, arguments));
  },
  fatal: function() {
    console.log('    error:'.red, util.format.apply(util, arguments));
    process.exit(1);
  }
}
