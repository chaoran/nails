var assert = require('assert')
  , Adapter = require('../lib/adapter')

describe('Adapter', function() {
  var adapters = [
    Adapter.make({ adapter: 'postgres', database: 'postgres' }), 
    Adapter.make({ adapter: 'mysql', database: 'mysql', user: 'root' })
  ];

  for (var i = 0, l = adapters.length; i < l; ++i) {
    describe(adapters[i].name, function() {
      describe('#connect()', function() {
        var adapter = adapters[i];

        it('should connect successfully', function(done) {
          adapter.connect(function(err) {
            done(err);
          });
        });
      });
    });
  }
});
