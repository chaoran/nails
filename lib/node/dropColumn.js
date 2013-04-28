var Node = require(__dirname);

module.exports = Node.define(
  'DropColumn', 
  function(name) {
    this.name = name;
  }
);
