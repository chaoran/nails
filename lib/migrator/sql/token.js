var inherits = require('util').inherits;

var Token = module.exports = function() { 
  this.children = []; 
};

Token.define = function(type, constructor, proto) {
  var ctor;
  if (!constructor) {
    ctor = function() {
      Token.call(this);
    };
  } else {
    ctor = function() {
      Token.call(this);
      constructor.apply(this, arguments);
    }
  }

  inherits(ctor, Token);

  for (var method in proto) 
    ctor.prototype[method] = proto[method];

  ctor.prototype.type = type;

  return ctor;
};

Token.prototype.add = function(node) {
  this.children.push(node);
};
