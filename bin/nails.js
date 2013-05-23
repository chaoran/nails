#!/usr/bin/env node

var args = process.argv.slice(2)
  , Generator = require('../lib/generator')
  , command = args.shift();

switch (command) {
  case 'new': args.unshift('app'); // intentional fail through case
  case 'generate': {
    var g = Generator.make(args.shift());
    return g.generate.apply(g, args);
  }
  default: throw new Error('unrecognized command: ', command);
}
