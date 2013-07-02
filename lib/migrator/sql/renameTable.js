var Token = require('./token');

module.exports = Token.define(
  'RenameTable', 
  function(name, new_name) {
    this.name = name;
    this.newName = new_name;
  }
);
