var neutron = { }

Object.defineProperty(neutron, 'Jakefile', {
  get: function() {
    delete this.Jakefile;
    return this.Jakefile = require('./lib/Jakefile');
  },
  configuration: true
});

module.exports = neutron;
