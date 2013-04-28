var fs = require('fs')
  , path = require('path')
  , moment = require('moment')
  , config = require('../config');

module.exports = function(name) {
  var dir = path.join(config.paths.root, config.paths.db.migrate)
    , pkg_version = config.package.version
    , version = moment().format('YYYYMMDDHHmmssSSS')
    , temp_path = path.join(__dirname, 'templates/migration.js')

  // add package version number before timestamp
  version += version.split('.').map(function(n) {
    return n[0];
  }).join('');

  var filename = version + '-' + name + '.js'
    , filepath = path.join(dir, filename);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, '0755');

  fs.writeFileSync(filepath, fs.readFileSync(temppath));
}
