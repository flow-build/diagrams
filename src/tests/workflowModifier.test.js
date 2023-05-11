const blueprintSample = require('../samples/blueprint');
const {
  removeNodesByCategory,
  pinNodesByTypeAndCategory,
} = require('../utils/workflowModifier');

describe('Test removeNodesByCategory setToBag', () => {
  test('should return blueprint_spec without nodes of category setToBag', async () => {
    const blueprint_spec = await removeNodesByCategory(
      blueprintSample.blueprint_spec,
      'settobag'
    );
    const setToBagNodes = blueprint_spec.nodes.find(
      (node) => node?.category?.toLowerCase() === 'settobag'
    );
    expect(blueprint_spec).toBeDefined();
    expect(blueprint_spec.nodes).toHaveLength(11);
    expect(setToBagNodes).toBeUndefined();
  });
});

describe('Test pinNodesByTypeAndCategory', () => {
  test('should return blueprint_spec with nodes start, userTask, timer, flow and finish', async () => {
    const nodesToPin = [
      'start',
      'usertask',
      'flow',
      'finish',
      'timer',
      'event',
    ];
    const blueprint_spec = await pinNodesByTypeAndCategory(
      blueprintSample.blueprint_spec,
      nodesToPin
    );
    expect(blueprint_spec).toBeDefined();
    expect(blueprint_spec.nodes).toHaveLength(9);
  });
});
