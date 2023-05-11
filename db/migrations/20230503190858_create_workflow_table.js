exports.up = function (knex) {
  return knex.schema.createTable('workflow', (table) => {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.string('name', 255).notNullable();
    table.integer('version').notNullable();
    table.uuid('server_id').notNullable();
    table.uuid('blueprint_id').notNullable();
    table.foreign('server_id').references('server.id').onDelete('CASCADE');
    table
      .foreign('blueprint_id')
      .references('blueprint.id')
      .onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  table.dropForeign('server_id');
  table.dropForeign('blueprint_id');
  return knex.schema.dropTable('workflow');
};
