require('dotenv').config();
const { logger } = require('../utils/logger');
const axios = require('axios');

const getToken = async (flowbuildUrl) => {
  logger.debug('getToken service called');
  let error = null;

  const token = await axios
    .post(`${flowbuildUrl}/token`)
    .then((response) => response.data.jwtToken)
    .catch((err) => {
      logger.debug(err.message);
      error = err.message;
    });

  return { token, error };
};

const getFlowbuildWorkflow = async (flowbuildUrl, token, workflowId) => {
  logger.debug('getWorkflowFromFlowbuild service called');
  let error = null;

  const workflow = await axios
    .get(`${flowbuildUrl}/workflows/${workflowId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data)
    .catch((err) => {
      logger.debug(err.message);
      error = err.message;
    });
  return { workflow, error };
};

const getFlowbuildWorkflows = async (flowbuildUrl, token) => {
  logger.debug('getFlowbuildWorkflows service called');

  const workflows = await axios
    .get(`${flowbuildUrl}/workflows`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data);

  return workflows;
};

module.exports = {
  getFlowbuildWorkflow,
  getFlowbuildWorkflows,
  getToken,
};
