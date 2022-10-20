exports.seed = async function(knex) {
  await knex('workflows').del();
  await knex('workflows').insert([
    {
      id: 'ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f', 
      server: 'http://localhost:3000',
      blueprint_id: '42a9a60e-e2e5-4d21-8e2f-67318b100e38'
    }
  ]);
};
