//var currentApp;

var neutron = module.exports = {};
  //function() {
  //if (!currentApp) currentApp = locateApp();
  //return currentApp;
//};

Object.defineProperty(neutron, 'Jakefile', {
  get: function() {
    delete this.Jakefile;
    return this.Jakefile = require('./lib/Jakefile');
  },
  configurable: true
});

Object.defineProperty(neutron, 'ActiveRecord', {
  get: function() {
    delete this.ActiveRecord;
    return this.ActiveRecord = require('./lib/ActiveRecord');
  },
  configurable: true
});

//Object.defineProperty(neutron, 'app', {
  //get: function() {
    //delete this.app;
    //return this.app = require('./lib/app')();
  //},
  //configurable: true
//});

//function locateApp() {
  //var path = require('path')
    //, fs = require('fs')
    //, root = process.cwd()
    //, package;

  //do {
    //var packagePath = path.join(root, 'package.json');
    //if (fs.existsSync(packagePath )) {
      //package = require(packagePath);
      //if (package.dependencies.neutron) break;
    //}
  //} while ((root = path.dirname(root)) != '/');

  //if (root === '/') throw new Error('cannot find app root directory');

  //return new (require('./lib/app'))(root, package);
//}
