exports.up = function (knex) {
  return knex.schema.createTable("workflows", (table) => {
    table.uuid("id").primary();
    table.string("server", 255).notNullable();
    table.uuid("blueprint_id").notNullable();
    table.foreign("blueprint_id").references("blueprints.id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("workflows");
};
