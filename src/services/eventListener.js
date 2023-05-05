require('dotenv').config();
const { id } = require("cls-rtracer");
const { getBlueprintCore, getWorkflowCore, getDiagramCore, getDiagramToWorkflowCore } = require('../diagramCore');
const { checkAlignment } = require('../utils/alignment');
const { getWorkflowFromFlowbuild } = require('../services/getFlowbuildBlueprint');
const { logger } = require('../utils/logger');

function startEventListener(event) {
  event.on('Check Alignment', async (requestBody) => {
    const { workflow_id, diagram_xml, diagram_id } = requestBody;

    logger.info(`Listened to Check Alignment - TID: ${id()} - Diagram_id: ${diagram_id}`);
 
    const blueprintCore = getBlueprintCore(); 
    const workflowCore = getWorkflowCore(); 
    const diagramCore = getDiagramCore(); 
    const diagramToWorkflowCore = getDiagramToWorkflowCore();

    const workflowFetched = await workflowCore.getWorkflowById(workflow_id);
    
    if (workflowFetched) {        
      await diagramToWorkflowCore.saveDiagramToWorkflow({ diagram_id, workflow_id });

      const { blueprint_spec } = await blueprintCore.getBlueprintById(workflowFetched.blueprint_id);
      
      if (blueprint_spec?.nodes) {
        const blueprint = {
          name: 'Check_Alignment',
          description: 'Check Alignment',
          blueprint_spec
        }
        const aligned = await checkAlignment(blueprint, diagram_xml);
        
        await diagramCore.updateDiagram(diagram_id, {
          blueprint_id: workflowFetched.blueprint_id,
          aligned
        });
      } else {
        logger.warn(`Check Alignment Warn: no blueprint_spec, trying to fetch again - Diagram_id: ${diagram_id}`);
        const { blueprint, error } = await getWorkflowFromFlowbuild(workflow_id);

        if (error) {
          logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
          await workflowCore.updateWorkflow(workflow_id, { 
            server: `unavailable: ${process.env.FLOWBUILD_URL}`
          });
          return;
        } else if (blueprint) {
          await blueprintCore.updateBlueprint(workflowFetched.blueprint_id, blueprint.blueprint_spec);
          await workflowCore.updateWorkflow(workflow_id, { 
            server: process.env.FLOWBUILD_URL
          });

          const aligned = await checkAlignment(blueprint, diagram_xml);
          await diagramCore.updateDiagram(diagram_id, {
            blueprint_id: workflowFetched.blueprint_id,
            aligned
          });
        } else {
          logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
          await workflowCore.updateWorkflow(workflow_id, { 
            server: `workflow not found: ${process.env.FLOWBUILD_URL}`
          });
          return;
        }
      }
    } else {
      const blueprintSaved = await blueprintCore.saveBlueprint({});

      await workflowCore.saveWorkflow({ 
        id: workflow_id, 
        server: process.env.FLOWBUILD_URL, 
        blueprint_id: blueprintSaved.id 
      });

      await diagramToWorkflowCore.saveDiagramToWorkflow({ diagram_id, workflow_id });
      const { blueprint, error } = await getWorkflowFromFlowbuild(workflow_id);

      if (error) {
        logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
        await workflowCore.updateWorkflow(workflow_id, { 
          server: `unavailable: ${process.env.FLOWBUILD_URL}`
        });
        return;
      } else if (blueprint) {
        await blueprintCore.updateBlueprint(blueprintSaved.id, blueprint.blueprint_spec);

        const aligned = await checkAlignment(blueprint, diagram_xml);
        await diagramCore.updateDiagram(diagram_id, {
          blueprint_id: blueprintSaved.id,
          aligned
        });
      } else {
        logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
        await workflowCore.updateWorkflow(workflow_id, { 
          server: `workflow not found: ${process.env.FLOWBUILD_URL}`
        });
        return;
      }
    }
    logger.info(`Check Alignment Finished - Diagram_id: ${diagram_id}`);
  });
}

module.exports = {
  startEventListener,
};
