module.exports = {
  up: function() {
    this.createTable('users', function(t) {
      t.string('username', { null: false });
      t.string('password', { null: false });
      t.timestamp('created_at', { default: 'now()' });
      t.integer('age');
      t.boolean('isMale');
    });
    this.addIndex('users', 'username', { unique: true });
  },
  down: function() {
    this.dropTable('users');
  }
}
