exports.up = function (knex) {
  return knex.schema.createTable('server', (table) => {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.string('url', 255).notNullable().unique();
    table.string('namespace', 255).notNullable();
    table.jsonb('config').nullable();
    table.timestamp('last_sync').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('server');
};
