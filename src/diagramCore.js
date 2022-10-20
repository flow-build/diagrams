let diagramCore;
let blueprintCore;
let workflowCore;
let diagramToWorkflowCore;

function getDiagramCore() {
  return diagramCore;
}

function setDiagramCore(diagramCore_) {
  diagramCore = diagramCore_;
}

function getBlueprintCore() {
  return blueprintCore;
}

function setBlueprintCore(blueprintCore_) {
  blueprintCore = blueprintCore_;
}

function getWorkflowCore() {
  return workflowCore;
}

function setWorkflowCore(workflowCore_) {
  workflowCore = workflowCore_;
}

function getDiagramToWorkflowCore() {
  return diagramToWorkflowCore;
}

function setDiagramToWorkflowCore(diagramToWorkflowCore_) {
  diagramToWorkflowCore = diagramToWorkflowCore_;
}

module.exports = {
  getDiagramCore,
  setDiagramCore,
  getBlueprintCore,
  setBlueprintCore,
  getWorkflowCore,
  setWorkflowCore,
  getDiagramToWorkflowCore,
  setDiagramToWorkflowCore
};
