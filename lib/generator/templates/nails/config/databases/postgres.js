module.exports = {
  development: {
    adapter: 'postgres',
    database: '%{app_name}_development',
    user: '%{app_name}'
  },
  test: {
    adapter: 'postgres',
    database: '%{app_name}_test'
    user: '%{app_name}'
  },
  production: {
    adapter: 'postgres',
    database: '%{app_name}_production'
    user: '%{app_name}'
  }
}
