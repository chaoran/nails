var SchemaSqlVisitor = require('../SchemaSqlVisitor')

module.exports = SchemaSqlVisitor.extend({
  visitAlterColumn: function(node) {
    this.append(' ALTER ').visitId(node.name);
    this.append(' TYPE ').visitDbType(node.dbType);

    if (node.defaultValue !== undefined) {
      this.append(', ALTER ').visitId(node.name);
      if (node.defaultValue !== null) {
        this.append(' SET DEFAULT ').visitLiteral(node.defaultValue);
      } else {
        this.append(' DROP DEFAULT');
      }
    }

    if (node.notNull !== undefined) {
      this.append(', ALTER ').visitId(node.name);
      if (node.notNull === false) {
        this.append(' SET NULL');
      } else {
        this.append(' NULL');
      }
    }
  },
  visitDbType: function(node) {
    var result;
    switch (node.name) {
      case 'string': {
        result = 'VARCHAR';
        node.limit = node.limit || 255;
      }; break;
      case 'binary': result = 'BYTEA'; break;
      case 'datetime': result = 'TIMESTAMP'; break;
      case 'primaryKey': {
        result = 'BIGSERIAL'; 
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
