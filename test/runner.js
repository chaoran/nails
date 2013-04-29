var assert = require('assert')
  , config = require('../lib/config')
  , Adapter = require('../lib/adapter')
  , Runner = require('../lib/runner')

var fakeDb = {
  done: function() {
  },
  cached: [],
  schemas: [],
  clear: function() {
    fakeDb.cached = [];
  },
  conn: {
    begin: function() {
      fakeDb.cached.push('BEGIN');
    },
    query: function(q, callback) {
      fakeDb.cached.push(q);

      if (q.indexOf('SELECT v FROM schema_migrations') == 0) {
        if (fakeDb.schemas.length === 0) 
          return callback(new Error('does not exists'));
        else 
          return callback(null, fakeDb.schemas[fakeDb.schemas.length - 1]);
      }

      if (q.indexOf('INSERT INTO schema_migrations') == 0) {
        fakeDb.schemas.push({ v: q.match(/[0-9]{20}/)[0] });
      }

      if (q.indexOf('DELETE FROM schema_migrations') == 0) {
        var v = q.match(/[0-9]{20}/)[0];
        fakeDb.schemas = fakeDb.schemas.filter(function(schema) {
          return (schema.v !== v)
        });
      }

      if (callback) callback(null);
    },
    commit: function(callback) {
      fakeDb.cached.push('COMMIT');
      callback();
    }
  }
}

function test(runner, method, desc, arg, cached, schemas) {
  describe('#' + method + '(' + (arg ? arg : '') + ')', function() {
    it(desc, function(done) {
      fakeDb.clear();
      runner[method](arg, function(err) {
        assert.ok((!err));
        assert.deepEqual(fakeDb.cached, cached);
        assert.deepEqual(fakeDb.schemas, schemas);
        done();
      });
    });
  });
}

var cached = {
  postgres: {
    1: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
      'BEGIN',
      'CREATE TABLE "users" ("username" VARCHAR(255) NOT NULL, "password" VARCHAR(255) NOT NULL, "created_at" TIMESTAMP DEFAULT \'now()\', "age" INTEGER, "isMale" BOOLEAN)',
      'CREATE UNIQUE INDEX "users_username_idx" ON "users" ("username")',
      'INSERT INTO schema_migrations VALUES (\'00120130428112123023\')',
      'COMMIT',
      'BEGIN',
      'CREATE TABLE "posts" ("user_id" INTEGER NOT NULL, "content" VARCHAR(255) DEFAULT \'\', "attachment" BYTEA, "created_at" TIMESTAMP DEFAULT \'now()\')',
      'CREATE INDEX "posts_content_idx" ON "posts" ("content")',
      'INSERT INTO schema_migrations VALUES (\'00120130429101234391\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE "posts" ADD "title" VARCHAR(255), ALTER "content" TYPE TEXT, ALTER "content" SET DEFAULT \'\'',
      'INSERT INTO schema_migrations VALUES (\'01120130430100153871\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE "users" ADD "password_salt" VARCHAR(255), RENAME "password" TO "password_hash"',
      'INSERT INTO schema_migrations VALUES (\'02320130430100340763\')',
      'COMMIT' 
    ],
    2: ['SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE "posts" RENAME "password_hash" TO "password", DROP "password_salt"',
      'DELETE FROM schema_migrations WHERE v=\'02320130430100340763\'',
      'COMMIT' 
    ],
    3: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE "posts" ALTER "content" TYPE VARCHAR(255), ALTER "content" SET DEFAULT \'\', DROP "title"',
      'DELETE FROM schema_migrations WHERE v=\'01120130430100153871\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE "posts"',
      'DELETE FROM schema_migrations WHERE v=\'00120130429101234391\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE "users"',
      'DELETE FROM schema_migrations WHERE v=\'00120130428112123023\'',
      'COMMIT' 
    ],
    4: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
      'BEGIN',
      'CREATE TABLE "users" ("username" VARCHAR(255) NOT NULL, "password" VARCHAR(255) NOT NULL, "created_at" TIMESTAMP DEFAULT \'now()\', "age" INTEGER, "isMale" BOOLEAN)',
      'CREATE UNIQUE INDEX "users_username_idx" ON "users" ("username")',
      'INSERT INTO schema_migrations VALUES (\'00120130428112123023\')',
      'COMMIT',
      'BEGIN',
      'CREATE TABLE "posts" ("user_id" INTEGER NOT NULL, "content" VARCHAR(255) DEFAULT \'\', "attachment" BYTEA, "created_at" TIMESTAMP DEFAULT \'now()\')',
      'CREATE INDEX "posts_content_idx" ON "posts" ("content")',
      'INSERT INTO schema_migrations VALUES (\'00120130429101234391\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE "posts" ADD "title" VARCHAR(255), ALTER "content" TYPE TEXT, ALTER "content" SET DEFAULT \'\'',
      'INSERT INTO schema_migrations VALUES (\'01120130430100153871\')',
      'COMMIT' 
    ],
    5: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE "posts" ALTER "content" TYPE VARCHAR(255), ALTER "content" SET DEFAULT \'\', DROP "title"',
      'DELETE FROM schema_migrations WHERE v=\'01120130430100153871\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE "posts"',
      'DELETE FROM schema_migrations WHERE v=\'00120130429101234391\'',
      'COMMIT' 
    ]
  },
  mysql: {
    1: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'CREATE TABLE `posts` (`user_id` INT NOT NULL, `content` VARCHAR(255) DEFAULT \'\', `attachment` BLOB, `created_at` DATETIME DEFAULT \'now()\')',
      'CREATE INDEX `posts_content_idx` ON `posts` (`content`)',
      'INSERT INTO schema_migrations VALUES (\'00120130429101234391\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE `posts` ADD `title` VARCHAR(255), MODIFY `content` TEXT DEFAULT \'\'',
      'INSERT INTO schema_migrations VALUES (\'01120130430100153871\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE `users` ADD `password_salt` VARCHAR(255), RENAME `password` TO `password_hash`',
      'INSERT INTO schema_migrations VALUES (\'02320130430100340763\')',
      'COMMIT' 
    ], 
    2: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE `posts` RENAME `password_hash` TO `password`, DROP `password_salt`',
      'DELETE FROM schema_migrations WHERE v=\'02320130430100340763\'',
      'COMMIT' 
    ],
    3: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE `posts` MODIFY `content` VARCHAR(255) DEFAULT \'\', DROP `title`',
      'DELETE FROM schema_migrations WHERE v=\'01120130430100153871\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE `posts`',
      'DELETE FROM schema_migrations WHERE v=\'00120130429101234391\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE `users`',
      'DELETE FROM schema_migrations WHERE v=\'00120130428112123023\'',
      'COMMIT' 
    ],
    4: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'CREATE TABLE schema_migrations (v varchar(17) UNIQUE)',
      'BEGIN',
      'CREATE TABLE `users` (`username` VARCHAR(255) NOT NULL, `password` VARCHAR(255) NOT NULL, `created_at` DATETIME DEFAULT \'now()\', `age` INT, `isMale` TINYINT(1))',
      'CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`)',
      'INSERT INTO schema_migrations VALUES (\'00120130428112123023\')',
      'COMMIT',
      'BEGIN',
      'CREATE TABLE `posts` (`user_id` INT NOT NULL, `content` VARCHAR(255) DEFAULT \'\', `attachment` BLOB, `created_at` DATETIME DEFAULT \'now()\')',
      'CREATE INDEX `posts_content_idx` ON `posts` (`content`)',
      'INSERT INTO schema_migrations VALUES (\'00120130429101234391\')',
      'COMMIT',
      'BEGIN',
      'ALTER TABLE `posts` ADD `title` VARCHAR(255), MODIFY `content` TEXT DEFAULT \'\'',
      'INSERT INTO schema_migrations VALUES (\'01120130430100153871\')',
      'COMMIT' 
    ],
    5: [ 'SELECT v FROM schema_migrations ORDER BY v DESC LIMIT 1',
      'BEGIN',
      'ALTER TABLE `posts` MODIFY `content` VARCHAR(255) DEFAULT \'\', DROP `title`',
      'DELETE FROM schema_migrations WHERE v=\'01120130430100153871\'',
      'COMMIT',
      'BEGIN',
      'DROP TABLE `posts`',
      'DELETE FROM schema_migrations WHERE v=\'00120130429101234391\'',
      'COMMIT' 
    ]
  } 
};

var schemas = {
  1: [ { v: '00120130428112123023' },
    { v: '00120130429101234391' },
    { v: '01120130430100153871' },
    { v: '02320130430100340763' } 
  ],
  2: [ { v: '00120130428112123023' },
    { v: '00120130429101234391' },
    { v: '01120130430100153871' } 
  ],
  3: [],
  4: [ { v: '00120130428112123023' }, 
    { v: '00120130429101234391' },
    { v: '01120130430100153871' } 
  ],
  5: [ { v: '00120130428112123023' } ]
};

describe('Runner', function() {
  ['postgres', 'mysql'].forEach(function(name) {
    describe(name, function() {
      var adapter = Adapter.make({
        adapter: name
      });
      adapter.connect = function(callback) {
        callback(null, fakeDb.conn, fakeDb.done);
      }
      var runner = new Runner({
        dir: 'test/fixtures/migrate',
        adapter: adapter
      });

      test(runner, 'migrate', 'should migrate to the latest version', 
        undefined, cached[name][1], schemas[1]);
      test(runner, 'rollback', 'should rollback one step',
        undefined, cached[name][2], schemas[2]);
      test(runner, 'rollback', 'should rollback to version 0',
        4, cached[name][3], schemas[3]);
      test(runner, 'migrate', 'should migrate to a specific version', 
        '01120130430100153871', cached[name][4], schemas[4]);
      test(runner, 'migrate', 'should migrate to a previous version', 
        '00120130428112123023', cached[name][5], schemas[5]);
    });
  });
});
