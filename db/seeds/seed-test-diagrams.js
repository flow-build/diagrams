const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');

exports.seed = async function(knex) {
  await knex('diagrams').del();
  await knex('diagrams').insert([
    {
      id: 'd655538b-95d3-4627-acaf-b391fdc25142', 
      name: 'Example Diagram',
      diagram_xml: diagramSample,
      workflow_id: '7be513f4-98dc-43e2-8f3a-66e68a61aca8',
      aligned: true,
      user_id: '1'
    }
  ]);
};
