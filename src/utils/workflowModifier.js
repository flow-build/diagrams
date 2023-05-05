const _ = require('lodash');

async function removeNodesByCategory(blueprint_spec, category) {
  for (const node of blueprint_spec.nodes) {
    if (node.next && typeof node.next !== 'object') {
      let nextNode = node;
      do {
        nextNode = blueprint_spec.nodes.find((_node) => _node.id === nextNode.next);
      } while (nextNode?.category?.toLowerCase() === category);
      node.next = nextNode.id;
    } else if (node.next) {
      for (const [nextKey, nextValue] of _.uniq(Object.entries(node.next))) {
        let nextNode = blueprint_spec.nodes.find((_node) => _node.id === nextValue);
        while (nextNode?.category?.toLowerCase() === category) {
          nextNode = blueprint_spec.nodes.find((_node) => _node.id === nextNode.next);
        }
        if (nextNode.id === node.id) {
          delete node.next[nextKey];
        } else {
          node.next[nextKey] = nextNode.id;
        }
      }
    }
  }
  blueprint_spec.nodes = blueprint_spec.nodes.filter((node) => node?.category?.toLowerCase() !== category);
  return blueprint_spec;
}

module.exports = {
  removeNodesByCategory,
}