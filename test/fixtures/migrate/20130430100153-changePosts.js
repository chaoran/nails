module.exports = {
  up: function() {
    this.changeTable('posts', function(t) {
      t.string('title');
      t.change('content', 'text', { default: '' });
    });
  },
  down: function() {
    this.changeTable('posts', function(t) {
      t.change('content', 'string', { default: '' });
      t.remove('title');
    });
  }
}
