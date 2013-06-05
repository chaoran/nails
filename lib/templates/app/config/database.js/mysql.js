module.exports = {
  development: {
    adapter: 'mysql',
    database: '%{app_name}_development',
    user: 'root'
  },
  test: {
    adapter: 'mysql',
    database: '%{app_name}_test',
    user: 'root'
  },
  production: {
    adapter: 'mysql',
    database: '%{app_name}_production',
    user: 'root'
  }
}
