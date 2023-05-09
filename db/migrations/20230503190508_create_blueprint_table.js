exports.up = function (knex) {
  return knex.schema.createTable("blueprint", (table) => {
    table.uuid("id").primary();
    table.timestamps(true, true);
    table.jsonb("blueprint_spec").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("blueprint");
};
