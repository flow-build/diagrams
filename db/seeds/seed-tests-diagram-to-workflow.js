exports.seed = async function(knex) {
  await knex('diagram_to_workflow').del();
  await knex('diagram_to_workflow').insert([
    {
      diagram_id: 'd655538b-95d3-4627-acaf-b391fdc25142',
      workflow_id: 'ae7e95f6-787a-4c0b-8e1a-4cc122e7d68f',
    }
  ]);
};
