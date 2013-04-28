var Index = module.exports = function(table, columns, options) {
  this.table = table;

  if (options) {
    if (options.unique) this.unique = true;
    if (options.name) this.name = options.name;
  }

  this.columns = [];

  if (typeof columns === 'string') {
    this.columns.push({
      name: columns,
      order: options ? options.order : undefined
    });
  } else {
    for (var i = 0, l = columns.length; i < l; ++i) {
      var column = { name: columns[i] };
      if (options && options.order) {
        column.order = options.order[columns[i]];
      }
      this.columns.push(column);
    }
  }

  if (options && options.name) {
    this.name = options.name;
  } else {
    this.name = this.table;
    for (var i = 0, l = this.columns.length; i < l; ++i) {
      this.name += '_' + this.columns[i].name;
    }
    this.name += '_idx';
  }
};
