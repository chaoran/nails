#!/usr/bin/env node

var say = require('../lib/say')
  , generate = require('../lib/generate')
  , colors = require('colors')
  , args = process.argv.slice(2);

var time = function () {
  var time = process.hrtime();
  return function(err) {
    if (err) say.fatal(err.message);
    time = process.hrtime(time);
    var ms = time[0] * 1e3 + time[1] / 1e6;
    console.log('time elasped: %dms'.grey, ms.toFixed(0));
  };
};

var command = args.shift();
switch (command) {
  case 'new': {
    var root = args.shift();
    var options = require('optimist').default({
      'database': 'postgres'
    }).alias('d', 'database').parse(args);

    generate.app(root, options, time()); 
  }; break;
  case 'generate': {
    var entity = args.shift();
    args.push(time());
    generate[entity].apply(generate, args);
  }; break;
  default: say.fatal('unrecognized command: ' + command);
}
