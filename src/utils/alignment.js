const { buildBlueprintFromBpmn } = require('@flowbuild/nodejs-diagram-builder');
const _ = require('lodash');

const checkAlignment = async (bp, diagram) => {
  const bpClean = bp.blueprint_spec.nodes.map((node) => {
    return { id: node.id, next: node.next, type: node.type.toLowerCase() }
  });
  
  const bpDiagram = await buildBlueprintFromBpmn(diagram);

  const bpDiagramClean = bpDiagram.blueprint.blueprint_spec.nodes.map((node) => {
    const id = node.name.replaceAll(' ', '-');
    const nextId = bpDiagram.blueprint.blueprint_spec.nodes.find((nextNode) => nextNode.id === node.next);
    const next = nextId === undefined ? null : nextId.name.replaceAll(' ', '-');
    return { id, next, type: node.type.toLowerCase() }
  });
  console.log(bpDiagramClean)

  return _.isEqual(bpClean, bpDiagramClean);
}

module.exports = {
  checkAlignment
}