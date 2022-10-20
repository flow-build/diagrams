const { blueprint_spec } = require('../../src/samples/blueprint');

exports.seed = async function(knex) {
  await knex('blueprints').del();
  await knex('blueprints').insert([
    {
      id: '42a9a60e-e2e5-4d21-8e2f-67318b100e38', 
      blueprint_spec: blueprint_spec
    }
  ]);
};
