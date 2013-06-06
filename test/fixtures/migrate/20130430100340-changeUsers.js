module.exports = {
  up: function() {
    this.changeTable('users', function(t) {
      t.string('password_salt');
      t.rename('password', 'password_hash');
    });
  },
  down: function() {
    this.changeTable('posts', function(t) {
      t.rename('password_hash', 'password');
      t.remove('password_salt');
    });
  }
}
