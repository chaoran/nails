module.exports = function(args) {
  var command = args.shift();
  switch (command) {
    case 'app': require('./app')(args); break;
    case 'migration': require('./migration')(args); break;
    default: throw new Error('unrecognized command: ', command);
  }
}
