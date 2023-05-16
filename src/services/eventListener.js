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
}

module.exports = {
  startEventListener,
};
