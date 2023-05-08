require('dotenv').config();
const { id } = require('cls-rtracer');
const { getBlueprintCore, getWorkflowCore, getDiagramCore, getServerCore } = require('../diagramCore');
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
    const serverCore = getServerCore();

    const workflowFetched = await workflowCore.getWorkflowById(workflow_id);
    
    if (workflowFetched) {
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
          is_aligned: aligned
        });
      } else {
        logger.warn(`Check Alignment Warn: no blueprint_spec, trying to fetch again - Diagram_id: ${diagram_id}`);
        const { blueprint, error } = await getWorkflowFromFlowbuild(workflow_id);

        if (error) {
          logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
          return;
        } else if (blueprint) {
          await blueprintCore.updateBlueprint(workflowFetched.blueprint_id, blueprint.blueprint_spec);
          const server = await serverCore.saveServer({ 
            url: process.env.FLOWBUILD_URL
          });
          await workflowCore.updateWorkflow(workflow_id, { 
            server_id: server.id,
          });

          const aligned = await checkAlignment(blueprint, diagram_xml);
          await diagramCore.updateDiagram(diagram_id, {
            blueprint_id: workflowFetched.blueprint_id,
            is_aligned: aligned,
          });
        } else {
          logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
          return;
        }
      }
    } 
    else {
      const { blueprint, error } = await getWorkflowFromFlowbuild(workflow_id);

      if (error) {
        logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
        return;
      } else if (blueprint) {
        const blueprintSaved = await blueprintCore.saveBlueprint(blueprint.blueprint_spec);
        const server = await serverCore.saveServer({ 
          url: process.env.FLOWBUILD_URL
        });
        await workflowCore.saveWorkflow({
          id: blueprint.workflow_id,
          name: blueprint.name,
          version: blueprint.version,
          blueprint_id: blueprintSaved.id,
          server_id: server.id
        });

        const aligned = await checkAlignment(blueprint, diagram_xml);
        await diagramCore.updateDiagram(diagram_id, {
          blueprint_id: blueprintSaved.id,
          is_aligned: aligned,
        });
      } else {
        logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
        return;
      }
    }
    logger.info(`Check Alignment Finished - Diagram_id: ${diagram_id}`);
  });
}

module.exports = {
  startEventListener,
};
