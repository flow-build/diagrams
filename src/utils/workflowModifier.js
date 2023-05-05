const _ = require('lodash');

function getNextExcludingCategory(nodes, next, category) {
  nodes.map((myNode) => {
    if (next === myNode.id && myNode?.category?.toLowerCase() === category) {
      next = myNode.next;
    }
  });
  return next;
}

async function removeNodesByCategory(blueprint_spec, category) {
  let blueprint = _.cloneDeep(blueprint_spec);
  const nodes = [...blueprint_spec.nodes];
  const filteredNodes = nodes.filter((node) => node?.category?.toLowerCase() !== category);

  blueprint.nodes = filteredNodes.map((node) => {
    // early return finish nodes
    if (!node.next) {
      return node;
    }
    // check unique nexts of flow nodes and get new next
    if (typeof node.next === 'object') {
      _.uniq(Object.entries(node.next)).map(([nextKey, nextValue]) => {
        node.next[nextKey] = getNextExcludingCategory(nodes, nextValue, category);
        if (node.id === node.next[nextKey]) {
          delete node.next[nextKey];
        }
      });
      return node;
    }
    node.next = getNextExcludingCategory(nodes, node.next, category);
    return node;
  });
  return blueprint;
}

module.exports = {
  removeNodesByCategory,
}