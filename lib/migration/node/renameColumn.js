var Node = require(__dirname);

module.exports = Node.define(
  'RenameColumn', 
  function(name, new_name) {
    this.name = name;
    this.newName = new_name;
  }
);
