const diagramSample = require('fs').readFileSync(
  './src/samples/diagram.xml',
  'utf8'
);

exports.seed = async function (knex) {
  await knex('diagram').del();
  await knex('diagram').insert([
    {
      id: 'd655538b-95d3-4627-acaf-b391fdc25142',
      name: 'Example Diagram',
      diagram_xml: diagramSample,
      blueprint_id: '42a9a60e-e2e5-4d21-8e2f-67318b100e38',
      user_id: '60d89f41-40ef-40c2-82f4-373083bd65d2',
      is_aligned: true,
      is_public: false,
    },
  ]);
};
