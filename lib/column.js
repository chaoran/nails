var Column = function(row) {
  this.name = row.field;
  this.type = row.type;
  this.notNull = (row.null === 'NO');
  this.primaryKey = (row.key === 'PRI');
  this.defaultValue = (row.default !== 'NULL');
};


