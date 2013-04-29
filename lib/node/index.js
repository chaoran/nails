var util = require('util');

var Node = module.exports = function() {
  this.children = [];
};

Node.define = function(type, constructor) {
  var ctor;
  if (!constructor) {
    ctor = function() {
      Node.call(this);
    };
  } else {
    ctor = function() {
      Node.call(this);
      constructor.apply(this, arguments);
    }
  }

  util.inherits(ctor, Node);
  ctor.prototype.type = type;

  return ctor;
};

Node.prototype.add = function(node) {
  this.children.push(node);
};

Node.prototype.toSQL = function(adapter) {
  var v = new adapter.SqlVisitor();
  return v.visit(this);
};

Node.includeColumnMethods = function(constructor) {
  var methods = require('./dbType').TYPES;

  for (var i = 0, l = methods.length; i < l; ++i) {
    constructor.prototype[methods[i]] = (function(type) {
      return function(name, options) {
        this.column(name, type, options);
      }
    })(methods[i]);
  }
};
