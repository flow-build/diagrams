exports.up = function (knex) {
  return knex.schema.createTable("diagram_to_workflow", (table) => {
    table.uuid("diagram_id").notNullable();
    table.uuid("workflow_id").notNullable();
    table.unique(["diagram_id", "workflow_id"]);
    table.foreign("diagram_id").references("diagrams.id");
    table.foreign("workflow_id").references("workflows.id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("diagram_to_workflow");
};
