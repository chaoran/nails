var should = require('should')
  , adapter = require('../lib/adapter')

var test = function(adapter) {
  describe(adapter.name, function() {
    describe('#createDb()', function() {
      it('should create a database', function(done) {
        adapter.createDb(function(err) {
          should.not.exists(err);
          done();
        });
      });
    });
    describe('#connect()', function() {
      it('should connect successfully', function(done) {
        adapter.connect(function(err, conn, end) {
          should.not.exists(err);
          end();
          done();
        });
      });
    });
    describe('#close()', function() {
      it('should close successfully', function() {
        (function(){
          adapter.close();
        }).should.not.throw();
      });
    });
    describe('#dropDb()', function() {
      it('should drop a database', function(done) {
        adapter.dropDb(function(err) {
          should.not.exists(err);
          done();
        });
      });
    });
  });
}

var adapters = [adapter({
  config: {
    database: {
      adapter: 'postgres',
      database: 'testapp',
      user: 'testapp'
    }
  }
}), adapter({
  config: {
    database: {
      adapter: 'mysql',
      database: 'testapp',
      user: 'root',
    }
  }
})];

describe('adapter', function() {
  adapters.forEach(function(adapter) {
    test(adapter);
  });
});
