const { flowbuildApi, getToken } = require('../utils/api');
const { logger } = require ('../utils/logger');

const getWorkflowFromFlowbuild = async (workflow_id) => {
  logger.debug('getWorkflowFromFlowbuild service called');
  const token = await getToken();
  let error = null;

  const blueprint = await flowbuildApi.get(`/workflows/${workflow_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((response) => response.data)
    .catch((err) => {
      logger.error(err.message);
      error = err.message;
      return;
    });
  
  return {
    blueprint,
    error
  }
}

module.exports = {
  getWorkflowFromFlowbuild
}