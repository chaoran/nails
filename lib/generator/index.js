module.exports = function(args) {
  var command = args.shift();
  switch (command) {
    case 'migration': require('./migration')(args);
    default: throw new Error('unrecognized command: ', command);
  }
}
