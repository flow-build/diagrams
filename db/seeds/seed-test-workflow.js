exports.seed = async function(knex) {
  await knex('workflow').del();
  await knex('workflow').insert([
    {
      id: 'ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f',
      name: 'Example Workflow', 
      version: 1, 
      server_id: '1c8f314b-5421-40cb-9a5b-73fca821c88f',
      blueprint_id: '42a9a60e-e2e5-4d21-8e2f-67318b100e38'
    }
  ]);
};
