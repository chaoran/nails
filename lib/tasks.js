var Runner = require('./runner');

namespace('db', function() {
  task('migrate', { async: true }, function() {
    var runner = new Runner();
    runner.migrate(process.env.VERSION, complete);
  });
  task('rollback', { async: true }, function() {
    var runner = new Runner();
    runner.rollback(process.env.STEP, complete);
  });
});
