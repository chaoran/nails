var util = require('util');

var Visitor = module.exports = function() {
  this.query = '';
}

Visitor.extend = function(methods) {
  var constructor = function() {
    Visitor.call(this);
  };

  util.inherits(constructor, Visitor);

  for (var method in methods) {
    constructor.prototype[method] = methods[method];
  }

  return constructor;
};

Visitor.prototype = {
  append: function(string) {
    this.query += string;
    return this;
  },
  add: function(string) {
    this.query = string;
    return this;
  },
  visit: function(node) {
    var method = 'visit' + node.type;
    if (this[method] !== undefined) {
      this[method](node);
    } else {
      throw new Error('unexpected node: ', node.type);
    }

    return this.query;
  },
  visitCreateTable: function(node) {
    this.add('CREATE TABLE ').visitId(node.name);
    this.append(' (').visitDefineColumn(node.children[0]);
    for (var i = 1, l = node.children.length; i < l; ++i) {
      this.append(', ').visitDefineColumn(node.children[i]);
    }
    this.append(')');
  },
  visitAlterTable: function(node) {
    this.add('ALTER TABLE ').visitId(node.name);

    this.visit(node.children[0]);
    for (var i = 1, l = node.children.length; i < l; ++i) {
      this.append(',').visit(node.children[i]);
    }
  },
  visitRenameTable: function(node) {
    this.add('ALTER TABLE ').visitId(node.name);
    this.append(' RENAME TO ').visitId(node.newName);
  },
  visitDropTable: function(node) {
    this.add('DROP TABLE ').visitId(node.name);
  },
  visitCreateIndex: function(node) {
    var self = this;
    if (node.unique) {
      this.add('CREATE UNIQUE INDEX ');
    } else {
      this.add('CREATE INDEX ');
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
    this.add('DROP INDEX ').visitId(node.name);
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
