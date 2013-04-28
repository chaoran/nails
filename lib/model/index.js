
var Model = function() {
}

Model.define = function(def) {
  var NewModel = function(obj) {
    for (var attr in obj) {
      this[attr] = obj[attr];
    }
  }

  util.inherits(NewModel, Model);

  return NewModel;
}

Model.prototype = {
  save: function() {
  }
}
