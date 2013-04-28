#!/usr/bin/env node

var args = require('optimist').argv;
  , command = args._.shift();

switch (command) {
  case 'generate': require('./lib/generator')(args);
  default: throw new Error('unrecognized command: ', command);
}
