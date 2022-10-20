const { buildBlueprintFromBpmn } = require('@flowbuild/nodejs-diagram-builder');
const _ = require('lodash');

const checkAlignment = async (bp, diagram) => {
  const bpClean = bp.blueprint_spec.nodes.map((node) => {
    return { id: node.id, next: node.next, type: node.type.toLowerCase() }
  });
  const bpOrdered = bpClean.sort((a, b) =>  a.id > b.id ? -1 : 0);

  const bpDiagram = await buildBlueprintFromBpmn(diagram);

  const bpDiagramClean = bpDiagram.blueprint.blueprint_spec.nodes.map((node) => {
    const id = node?.name.replaceAll(' ', '-');
    let next;
    if (node.next && typeof node.next !== 'object') {
      const nextId = bpDiagram.blueprint.blueprint_spec.nodes.find((nextNode) => nextNode.id === node.next);
      next = nextId?.name.replaceAll(' ', '-');
    } else if (node.next) {
      next = {};
      for (const [key, value] of Object.entries(node.next)) {
        const nextId = bpDiagram.blueprint.blueprint_spec.nodes.find((nextNode) => nextNode.id === value);
        if (key.includes(', ')) {
          const keys = key.split(', ');
          keys.forEach(key => next[key] = nextId?.name.replaceAll(' ', '-'));
        } else if (key.includes(' ,')) {
          const keys = key.split(' ,');
          keys.forEach(key => next[key] = nextId?.name.replaceAll(' ', '-'));
        } else {
          next[key] = nextId?.name.replaceAll(' ', '-');
        }
      }
    } else {
      next = null;
    }
    return { id, next, type: node.type.toLowerCase() }
  });
  const bpDiagramOrdered = bpDiagramClean.sort((a, b) =>  a.id > b.id ? -1 : 0);
  
  return _.isEqual(bpOrdered, bpDiagramOrdered);
}

module.exports = {
  checkAlignment
}