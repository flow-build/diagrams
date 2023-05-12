require('dotenv').config();
const { getDiagramCore, getServerCore } = require('../diagramCore');
const { getFlowbuildWorkflow } = require('../services/flowbuildApi');
const { logger } = require('../utils/logger');
const { buildXmlDiagram } = require('@flowbuild/nodejs-diagram-builder');
const {
  removeNodesByCategory,
  pinNodesByTypeAndCategory,
} = require('../utils/workflowModifier');
const _ = require('lodash');

function startEventListener(event) {
  event.on('Sync server', async (eventData) => {
    const { server, workflows, token } = eventData;
    logger.info(
      `[Sync server] Started - Server:'${server.url}' - Server_id: ${server.id}`
    );

    try {
      const serverCore = getServerCore();
      const diagramCore = getDiagramCore();
      const errors = [];

      for await (const _workflow of workflows) {
        let workflowDb = await diagramCore.getLatestDiagramByWorkflowId(
          _workflow.workflow_id
        );
        if (workflowDb) {
          logger.debug(
            `[Sync server] Workflow already in database: ${workflowDb.id}`
          );
          continue;
        }

        const { workflow, error } = await getFlowbuildWorkflow(
          server.url,
          token,
          _workflow.workflow_id
        );
        if (error) {
          throw error;
        }

        let blueprint = {
          name: workflow.name,
          description: workflow.description,
          blueprint_spec: _.cloneDeep(workflow.blueprint_spec),
        };
        const workflow_data = {
          ...blueprint,
          id: workflow.workflow_id,
          version: workflow.version,
          server_id: server.id,
        };

        try {
          const diagramStandardXml = await buildXmlDiagram(blueprint);
          await diagramCore.saveDiagram({
            diagram_xml: diagramStandardXml,
            name: workflow.name,
            type: 'standard',
            isPublic: true,
            workflow_data,
          });
        } catch (err) {
          errors.push({ workflow: blueprint.name, error: err });
          logger.error(
            `[Sync server] Error building diagram standard for '${blueprint.name}': ${err}`
          );
        }

        try {
          const blueprintNoBags = await removeNodesByCategory(
            workflow.blueprint_spec,
            'settobag'
          );
          blueprint.blueprint_spec = blueprintNoBags;
          const diagramNoBagsXml = await buildXmlDiagram(blueprint);
          await diagramCore.saveDiagram({
            diagram_xml: diagramNoBagsXml,
            name: workflow.name,
            type: 'nobags',
            isPublic: true,
            workflow_data,
          });
        } catch (err) {
          errors.push({ workflow: blueprint.name, error: err });
          logger.error(
            `[Sync server] Error building diagram nobags for '${blueprint.name}': ${err}`
          );
        }

        try {
          const nodesToPin = [
            'start',
            'usertask',
            'flow',
            'finish',
            'timer',
            'event',
          ];
          const blueprintUserTask = await pinNodesByTypeAndCategory(
            workflow.blueprint_spec,
            nodesToPin
          );
          blueprint.blueprint_spec = blueprintUserTask;
          const diagramUserTaskXml = await buildXmlDiagram(blueprint);
          await diagramCore.saveDiagram({
            diagram_xml: diagramUserTaskXml,
            name: workflow.name,
            type: 'usertask',
            isPublic: true,
            workflow_data,
          });
        } catch (err) {
          errors.push({ workflow: blueprint.name, error: err });
          logger.error(
            `[Sync server] Error building diagram usertask for '${blueprint.name}': ${err}`
          );
        }
      }

      if (errors.length > 0) {
        logger.info(
          `[Sync server] Finished with errors - Server: '${server.url}' - Server_id: ${server.id}`
        );
      } else {
        logger.info(
          `[Sync server] Finished successfully - Server: '${server.url}' - Server_id: ${server.id}`
        );
      }

      server.is_syncing = false;
      server.last_sync = new Date();
      await serverCore.updateServer(server.id, server);
    } catch (err) {
      logger.error(
        `[Sync server] Error syncing: ${err} - Server: '${server.url}' - Server_id: ${server.id}`
      );
    }
  });

  // temporarilly disabled
  // event.on('Check Alignment', async (requestBody) => {
  //   const { workflow_id, diagram_xml, diagram_id } = requestBody;

  //   logger.info(`Listened to Check Alignment - TID: ${id()} - Diagram_id: ${diagram_id}`);

  //   const blueprintCore = getBlueprintCore();
  //   const workflowCore = getWorkflowCore();
  //   const diagramCore = getDiagramCore();
  //   const serverCore = getServerCore();

  //   const workflowFetched = await workflowCore.getWorkflowById(workflow_id);

  //   if (workflowFetched) {
  //     const { blueprint_spec } = await blueprintCore.getBlueprintById(workflowFetched.blueprint_id);

  //     if (blueprint_spec?.nodes) {
  //       const blueprint = {
  //         name: 'Check_Alignment',
  //         description: 'Check Alignment',
  //         blueprint_spec
  //       }
  //       const aligned = await checkAlignment(blueprint, diagram_xml);

  //       await diagramCore.updateDiagram(diagram_id, {
  //         blueprint_id: workflowFetched.blueprint_id,
  //         is_aligned: aligned
  //       });
  //     } else {
  //       logger.warn(`Check Alignment Warn: no blueprint_spec, trying to fetch again - Diagram_id: ${diagram_id}`);
  //       const { blueprint, error } = await getFlowbuildWorkflow(workflow_id);

  //       if (error) {
  //         logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
  //         return;
  //       } else if (blueprint) {
  //         await blueprintCore.updateBlueprint(workflowFetched.blueprint_id, blueprint.blueprint_spec);
  //         const server = await serverCore.saveServer({
  //           url: process.env.FLOWBUILD_URL
  //         });
  //         await workflowCore.updateWorkflow(workflow_id, {
  //           server_id: server.id,
  //         });

  //         const aligned = await checkAlignment(blueprint, diagram_xml);
  //         await diagramCore.updateDiagram(diagram_id, {
  //           blueprint_id: workflowFetched.blueprint_id,
  //           is_aligned: aligned,
  //         });
  //       } else {
  //         logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
  //         return;
  //       }
  //     }
  //   }
  //   else {
  //     const { blueprint, error } = await getFlowbuildWorkflow(workflow_id);

  //     if (error) {
  //       logger.warn(`Check Alignment Exited: Flowbuild server unavailable on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
  //       return;
  //     } else if (blueprint) {
  //       const blueprintSaved = await blueprintCore.saveBlueprint(blueprint.blueprint_spec);
  //       const server = await serverCore.saveServer({
  //         url: process.env.FLOWBUILD_URL
  //       });
  //       await workflowCore.saveWorkflow({
  //         id: blueprint.workflow_id,
  //         name: blueprint.name,
  //         version: blueprint.version,
  //         blueprint_id: blueprintSaved.id,
  //         server_id: server.id
  //       });

  //       const aligned = await checkAlignment(blueprint, diagram_xml);
  //       await diagramCore.updateDiagram(diagram_id, {
  //         blueprint_id: blueprintSaved.id,
  //         is_aligned: aligned,
  //       });
  //     } else {
  //       logger.warn(`Check Alignment Exited: Workflow not found on ${process.env.FLOWBUILD_URL} - Diagram_id: ${diagram_id}`);
  //       return;
  //     }
  //   }
  //   logger.info(`Check Alignment Finished - Diagram_id: ${diagram_id}`);
  // });
}

module.exports = {
  startEventListener,
};
