exports.seed = async function (knex) {
  await knex('server').del();
  await knex('server').insert([
    {
      id: '1c8f314b-5421-40cb-9a5b-73fca821c88f',
      url: 'http://localhost:8082',
      namespace: 'localhost',
    },
  ]);
};
