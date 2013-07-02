var Token = require('./token');

module.exports = Token.define('DropTable', function(name) {
  this.name = name;
});
