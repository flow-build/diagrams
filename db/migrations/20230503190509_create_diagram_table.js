exports.up = function (knex) {
  return knex.schema.createTable('diagram', (table) => {
    table.uuid('id').primary();
    table.timestamps(true, true);
    table.string('name', 255).notNullable();
    table.specificType('diagram_xml', 'xml').notNullable();
    table.uuid('blueprint_id');
    table.uuid('user_id').nullable();
    table.boolean('is_public').nullable();
    table.boolean('user_default').nullable();
    table.boolean('is_aligned').nullable();
    table
      .foreign('blueprint_id')
      .references('blueprint.id')
      .onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  table.dropForeign('blueprint_id');
  return knex.schema.dropTable('diagram');
};
