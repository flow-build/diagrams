exports.up = function (knex) {
  return knex.schema.table('diagram', (table) => {
    table
      .enu('type', ['standard', 'nobags', 'usertask'], {
        enumName: 'diagram_type',
        defaulTo: 'standard',
      })
      .defaultTo('standard');
  });
};

exports.down = function (knex) {
  return knex.schema.table('diagram', (table) => {
    table.dropColumn('type');
  });
};
