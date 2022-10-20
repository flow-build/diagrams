const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');

exports.seed = async function(knex) {
  await knex('diagrams').del();
  await knex('diagrams').insert([
    {
      id: 'd655538b-95d3-4627-acaf-b391fdc25142', 
      name: 'Example Diagram',
      diagram_xml: diagramSample,
      blueprint_id: '42a9a60e-e2e5-4d21-8e2f-67318b100e38',
      aligned: true,
      user_id: '1'
    }
  ]);
};
