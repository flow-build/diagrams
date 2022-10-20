exports.up = function (knex) {
  return knex.schema.createTable("blueprints", (table) => {
    table.uuid("id").primary();
    table.jsonb("blueprint_spec").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("blueprints");
};
