var Parser = require(__dirname);

module.exports = Parser.extend({
  visitId: function(identifier) {
    this.append('`' + identifier + '`');
  },
  visitAlterColumn: function(node) {
    this.append(' MODIFY ').visitDefineColumn(node);
  },
  visitDropIndex: function(node) {
    this.start('DROP INDEX ').visitId(node.name);
    this.append(' ON ').visitId(node.table);
  },
  visitDbType: function(node) {
    var result;
    switch (node.name) {
      case 'boolean': {
        result = 'TINYINT';
        node.limit = node.limit || 1;
      }; break;
      case 'string': {
        result = 'VARCHAR';
        node.limit = node.limit || 255;
      }; break;
      case 'binary': result = 'BLOB'; break;
      case 'timestamp': result = 'DATETIME'; break;
      case 'integer': result = 'INT'; break;
      case 'primaryKey': {
        result = 'SERIAL'; 
        node.primaryKey = true;
      }; break;
      default: result = node.name.toUpperCase();
    }
    this.append(result);

    if (node.limit) {
      this.append('(' + node.limit + ')');
    } else if (node.precision) {
      this.append('(' + node.precision);
      if (node.scale) {
        this.append(',' + node.scale);
      }
      this.append(')');
    }

    if (node.primaryKey) this.append(' PRIMARY KEY');
  }
});
