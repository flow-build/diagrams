exports.up = function (knex) {
  return knex.schema.createTable("diagrams", (table) => {
    table.uuid("id").primary();
    table.string("name", 255).notNullable();
    table.specificType("diagram_xml", "xml").notNullable();
    table.uuid("workflow_id").nullable();
    table.string("user_id", 255).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("diagrams");
};
