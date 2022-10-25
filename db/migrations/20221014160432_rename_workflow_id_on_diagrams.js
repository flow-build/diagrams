exports.up = function(knex) {
  return knex.schema.alterTable("diagrams", function (table) {
    table.renameColumn("workflow_id", "blueprint_id");
    table.foreign("blueprint_id").references("blueprints.id");
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("diagrams");
};
