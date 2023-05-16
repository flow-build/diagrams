const _ = require('lodash');

function getNextExcludingCategory(nodes, next, category) {
  let node = { next };
  nodes.map((myNode) => {
    if (
      node.next === myNode.id &&
      myNode?.category?.toLowerCase() === category
    ) {
      node = myNode;
    }
  });
  if (node?.category?.toLowerCase() === category) {
    return getNextExcludingCategory(nodes, node.next, category);
  }
  return node.next;
}

function getNextOfPinnedNodes(nodes, next, pinnedNodes) {
  let node = { next };
  let nextNode;
  nodes.map((myNode) => {
    if (node.next === myNode.id) {
      if (!shouldPinNode(myNode, pinnedNodes)) {
        node = myNode;
      } else {
        nextNode = myNode;
      }
    }
  });
  if (
    shouldPinNode(node, pinnedNodes) ||
    shouldPinNode(nextNode, pinnedNodes)
  ) {
    return node.next;
  } else {
    return getNextOfPinnedNodes(nodes, node.next, pinnedNodes);
  }
}

function shouldPinNode(node, nodesToPin) {
  return (
    nodesToPin.includes(node?.type?.toLowerCase()) ||
    nodesToPin.includes(node?.category?.toLowerCase())
  );
}

function orderBlueprintNodes(nodes) {
  return nodes.sort((a, b) => {
    if (a?.type?.toLowerCase() === 'start') {
      return -1;
    }
    if (b?.type?.toLowerCase() === 'start') {
      return 1;
    }
    return 0;
  });
}

async function removeNodesByCategory(blueprint_spec, category) {
  let blueprint = _.cloneDeep(blueprint_spec);
  const nodes = _.cloneDeep(blueprint_spec.nodes);
  const filteredNodes = nodes.filter(
    (node) => node?.category?.toLowerCase() !== category
  );

  blueprint.nodes = filteredNodes.map((node) => {
    // early return finish nodes
    if (!node.next) {
      return node;
    }
    // check unique nexts of flow nodes and get new next
    if (typeof node.next === 'object') {
      _.uniq(Object.entries(node.next)).map(([nextKey, nextValue]) => {
        node.next[nextKey] = getNextExcludingCategory(
          nodes,
          nextValue,
          category
        );
        if (node.id === node.next[nextKey]) {
          delete node.next[nextKey];
        }
      });
      return node;
    }
    node.next = getNextExcludingCategory(nodes, node.next, category);
    return node;
  });
  blueprint.nodes = orderBlueprintNodes(blueprint.nodes);
  return blueprint;
}

async function pinNodesByTypeAndCategory(blueprint_spec, nodesToPin) {
  let blueprint = _.cloneDeep(blueprint_spec);
  const nodes = _.cloneDeep(blueprint_spec.nodes);

  const filteredNodes = nodes.filter((node) => shouldPinNode(node, nodesToPin));
  blueprint.nodes = filteredNodes.map((node) => {
    // early return finish nodes
    if (!node.next) {
      return node;
    }
    // check unique nexts of flow nodes and get new next
    if (typeof node.next === 'object') {
      _.uniq(Object.entries(node.next)).map(([nextKey, nextValue]) => {
        node.next[nextKey] = getNextOfPinnedNodes(nodes, nextValue, nodesToPin);
        if (node.id === node.next[nextKey]) {
          delete node.next[nextKey];
        }
      });
      return node;
    }
    node.next = getNextOfPinnedNodes(nodes, node.next, nodesToPin);
    return node;
  });
  blueprint.nodes = orderBlueprintNodes(blueprint.nodes);
  return blueprint;
}

module.exports = {
  removeNodesByCategory,
  pinNodesByTypeAndCategory,
  orderBlueprintNodes,
};
