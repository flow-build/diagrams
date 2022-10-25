exports.up = function (knex) {
  return knex.schema.table("diagrams", (table) => {
    table.boolean("aligned");
  });
};

exports.down = function (knex) {
  return knex.schema.table("diagrams", (table) => {
    table.dropColumn("aligned");
  });
};