var Node = require(__dirname);

module.exports = Node.define(
  'DropTable', 
  function(name) {
    this.name = name;
  }
);
