var Template = require('./template')
  , say = require('./say')
  , path = require('path')
  , fs = require('fs')

module.exports = {
  app: function(root, options, callback) {
    var template = new Template('templates/app');
    template.map(
      'config/database.js', 
      'config/database.js/' + options.database + '.js'
    )
    template.set('app_name', path.basename(root));
    template.instantiate(root, function(err) {
      if (err) return callback(err);

      var command = 'cd ' + root + ' && npm link neutron'
      fs.exists(path.join(root, 'node_modules', 'neutron'), function(exists) {
        if (exists) {
          say.linked('neutron');
          return callback(null); 
        }

        require('child_process').exec(command, function(err) {
          if (err) return callback(err);
          say.run(command);
          callback(null);
        });
      });
    });
  },
  migration: function(name, callback) {
    var template = new Template('templates/migration.js')
      , version = require('moment')().format('YYYYMMDDHHmmss')
      , app = require('./app')
      , migrate_dir = path.join(app.root, app.config.path.db.migrate)
      , dest = path.join(migrate_dir, version + '-' + name);
    template.instantiate(dest, callback);
  }
}
