const blueprintSample = require('../samples/blueprint');
const { removeNodesByCategory } = require('../utils/workflowModifier');

describe('Test removeNodesByCategory setToBag', () => {
  test('should return blueprint_spec without nodes of category setToBag', async () => {
    const blueprint_spec = await removeNodesByCategory(blueprintSample.blueprint_spec, 'settobag');
    const setToBagNodes = blueprint_spec.nodes.find((node) => node?.category?.toLowerCase() === 'settobag');
    expect(blueprint_spec).toBeDefined();
    expect(blueprint_spec.nodes).toHaveLength(11);
    expect(setToBagNodes).toBeUndefined();
  });
});