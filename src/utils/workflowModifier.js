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

async function pinNodesByTypeAndCategory(blueprint_spec, nodesToPin) {
  for (const node of blueprint_spec.nodes) {
    if (node.next && typeof node.next !== 'object') {
      let nextNode = node;
      do {
        nextNode = blueprint_spec.nodes.find((_node) => _node.id === nextNode.next);
      } while (!nodesToPin.includes(nextNode?.type?.toLowerCase()) && !nodesToPin.includes(nextNode?.category?.toLowerCase()));
      node.next = nextNode.id;
    } else if (node.next) {
      for (const [nextKey, nextValue] of _.uniq(Object.entries(node.next))) {
        let nextNode = blueprint_spec.nodes.find((_node) => _node.id === nextValue);
        while (!nodesToPin.includes(nextNode?.type?.toLowerCase()) && !nodesToPin.includes(nextNode?.category?.toLowerCase())) {
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
  blueprint_spec.nodes = blueprint_spec.nodes.filter((node) => nodesToPin.includes(node?.type?.toLowerCase()) || nodesToPin.includes(node?.category?.toLowerCase()));
  return blueprint_spec;
}

module.exports = {
  removeNodesByCategory,
  pinNodesByTypeAndCategory,
}