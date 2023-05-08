let diagramCore;
let blueprintCore;
let workflowCore;
let serverCore;

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

function getServerCore() {
  return serverCore;
}

function setServerCore(serverCore_) {
  serverCore = serverCore_;
}

module.exports = {
  getDiagramCore,
  setDiagramCore,
  getBlueprintCore,
  setBlueprintCore,
  getWorkflowCore,
  setWorkflowCore,
  getServerCore,
  setServerCore,
};
