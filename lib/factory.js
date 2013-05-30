var util = require('util')
  , path = require('path')

module.exports = function(ctor) {
  if (!ctor) ctor = function() {};

  ctor.make = function(name) {
    try {
      var parent = path.dirname(module.parent.filename) 
      var Factory = require(path.join(parent, name));
      var instance = Object.create(Factory.prototype);
      Factory.apply(instance, arguments);
      return instance;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        console.log(err);
        return null;
      }
      else throw err;
    }
  }

  ctor.extend = function(child) {
    if (!child) child = function() {};
    util.inherits(child, ctor);
    return child;
  }

  return ctor;
}
