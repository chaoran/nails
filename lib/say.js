var colors = require('colors')
  , log = console.log;

module.exports = {
  identical: log.bind(console, '   identical:'.blue),
     linked: log.bind(console, '      linked:'.blue),
     create: log.bind(console, '      create:'.green),
        run: log.bind(console, '         run:'.green),
       drop: log.bind(console, '        drop:'.green),
     exists: log.bind(console, '      exists:'.yellow),
  fatal: function(message) {
    console.log('       error:'.red, message);
    process.exit(1);
  }
}
