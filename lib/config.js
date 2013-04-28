var path = require('path')
  , ENV = process.env.NODE_ENV || 'development';

module.exports = {
  paths: {
    root: process.cwd(),
    config: {
      database: 'config/database' 
    },
    db: {
      migrate: 'db/migrate'
    }
  },
  get database() {
    var p = path.join(this.paths.root, this.paths.config.database);
    return require(p)[ENV];
  },
};
