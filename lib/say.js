var colors = require('colors')
  , log = console.log
  , env = process.env.NODE_ENV || 'development';

var out = console
  , log = console.log;

if (env == 'test') {
  out = null;
  log = function() {};
}

module.exports = {
     create: log.bind(console, '      create:'.green),
       drop: log.bind(console, '        drop:'.green),
     exists: log.bind(console, '      exists:'.yellow),
  identical: log.bind(console, '   identical:'.blue),
     linked: log.bind(console, '      linked:'.blue),
    migrate: log.bind(console, '     migrate:'.green),
   rollback: log.bind(console, '    rollback:'.green),
        run: log.bind(console, '         run:'.green),
    version: log.bind(console, '     version:'.blue),
  fatal: function(message) {
    console.log('       error:'.red, message);
    process.exit(1);
  }
}
