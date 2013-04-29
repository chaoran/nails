module.exports = {
  up: function() {
    this.createTable('posts', function(t) {
      t.integer('user_id', { null: false });
      t.string('content', { default: '' });
      t.binary('attachment');
      t.timestamp('created_at', { default: 'now()' });
    });
    this.addIndex('posts', 'content');
  },
  down: function() {
    this.dropTable('posts');
  }
}
