const diagramSample = require('fs').readFileSync('./src/samples/diagram.xml', 'utf8');
const diagramMisaligned = require('fs').readFileSync('./src/samples/diagramMisaligned.xml', 'utf8');
const blueprintSample = require('../samples/blueprint');
const { checkAlignment } = require('../utils/alignment');

describe('Test checkAlignment service', () => {
  test('should return true for aligned', async () => {
    const aligned = await checkAlignment(blueprintSample, diagramSample);
    expect(aligned).toBeTruthy();
  });

  test('should return false for misaligned', async () => {
    const aligned = await checkAlignment(blueprintSample, diagramMisaligned);
    expect(aligned).toBeFalsy();
  });
});