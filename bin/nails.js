#!/usr/bin/env node

var args = process.argv.slice(2);
  , generate = require('./lib/generator');
  , command = args.shift();

switch (command) {
  case 'new': generate(args.unshift('app')); break;
  case 'generate': generate(args); break;
  default: throw new Error('unrecognized command: ', command);
}
