const { v4: uuid } = require('uuid'); 
    
exports.up = function (knex) {
  return knex.schema.alterTable("diagrams", function (table) {
    table.setNullable("user_id");
  });
};

exports.down = function (knex) {
  knex("diagrams")
    .whereNull("user_id")
    .update("user_id", uuid())
  return knex.schema.alterTable("diagrams", function (table) {
    table.dropNullable("user_id");
  });
};
