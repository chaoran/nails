var fs = require('fs')
  , path = require('path')
  , Template = require('./template')
  , Reporter = require('./reporter')

module.exports = {
  app: function(root, options, callback) {
    if (!callback) callback = function(err) { if (err) throw err; };

    var template = new Template('templates/app');

    template.map(
      'config/database.js', 
      'config/database.js/' + options.database + '.js'
    );
    template.set('app_name', path.basename(root));
    template.instantiate(root, function(err) {
      if (err) return callback(err);

      var command = 'cd ' + root + ' && npm link neutron'
        , reporter = new Reporter('run', command);

      fs.exists(path.join(root, 'node_modules', 'neutron'), function(exists) {
        if (exists) {
          reporter.message('exists', 'node_module/neutron');
          reporter.report(callback)(null);
        }

        require('child_process').exec(command, reporter.report(callback));
      });
    });
  },
  migration: function(name, callback) {
    if (!callback) callback = function(err) { if (err) throw err; };

    var template = new Template('templates/migration.js')
      , version = require('./version')() 
      , app = require('./app')()
      , migrate_dir = path.join(app.root, app.config.path.db.migrate)
      , dest = path.join(migrate_dir, version + '-' + name + '.js');

    template.instantiate(dest, callback);
  }
}
