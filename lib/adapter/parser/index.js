var Parser = module.exports = function() {
  if (this === global) return new (require('./' + arguments[0]))();
  this.query = '';
}

Parser.extend = function(methods) {
  var constructor = function() {
    Parser.call(this);
  };

  require('util').inherits(constructor, Parser);

  for (var method in methods) {
    constructor.prototype[method] = methods[method];
  }

  return constructor;
};

Parser.prototype = {
  append: function(string) {
    this.query += string;
    return this;
  },
  start: function(string) {
    this.query = string;
    return this;
  },
  parse: function(node) {
    var method = 'visit' + node.type;
    if (this[method] !== undefined) {
      this[method](node);
    } else {
      throw new Error('unexpected node: ', node.type);
    }

    return this.query;
  },
  visitCreateTable: function(node) {
    this.start('CREATE TABLE ').visitId(node.name);
    this.append(' (').visitDefineColumn(node.children[0]);
    for (var i = 1, l = node.children.length; i < l; ++i) {
      this.append(', ').visitDefineColumn(node.children[i]);
    }
    this.append(')');
  },
  visitAlterTable: function(node) {
    this.start('ALTER TABLE ').visitId(node.name);

    this.parse(node.children[0]);
    for (var i = 1, l = node.children.length; i < l; ++i) {
      this.append(',').visit(node.children[i]);
    }
  },
  visitRenameTable: function(node) {
    this.start('ALTER TABLE ').visitId(node.name);
    this.append(' RENAME TO ').visitId(node.newName);
  },
  visitDropTable: function(node) {
    this.start('DROP TABLE ').visitId(node.name);
  },
  visitCreateIndex: function(node) {
    var self = this;
    if (node.unique) {
      this.start('CREATE UNIQUE INDEX ');
    } else {
      this.start('CREATE INDEX ');
    }
    this.visitId(node.name);
    this.append(' ON ').visitId(node.table);
    this.append(' (');
    node.columns.forEach(function(column, index) {
      self.visitId(column.name);
      if (column.order) self.append(' ' + column.order);
      if (index !== node.columns.length - 1) self.append(', ');
    });
    this.append(')');
  },
  visitDropIndex: function(node) {
    this.start('DROP INDEX ').visitId(node.name);
  },
  visitDefineColumn: function(node) {
    this.visitId(node.name);
    this.append(' ').visitDbType(node.dbType);

    if (node.defaultValue !== undefined && node.defaultValue !== null) {
      this.append(' DEFAULT ').visitLiteral(node.defaultValue);
    }

    if (node.notNull) this.append(' NOT NULL');
  },
  visitAddColumn: function(node) {
    this.append(' ADD ').visitDefineColumn(node);
  },
  visitRenameColumn: function(node) {
    this.append(' RENAME ').visitId(node.name);
    this.append(' TO ').visitId(node.newName);
  },
  visitDropColumn: function(node) {
    this.append(' DROP ').visitId(node.name);
  },
  visitId: function(identifier) {
    this.append('"' + identifier + '"');
  },
  visitLiteral: function(literal) {
    this.append("'" + literal + "'");
  }
}
