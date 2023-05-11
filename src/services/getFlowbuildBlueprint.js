require('dotenv').config();
const { getToken } = require('../utils/api');
const { logger } = require('../utils/logger');
const axios = require('axios');

const getWorkflowFromFlowbuild = async (workflow_id) => {
  logger.debug('getWorkflowFromFlowbuild service called');
  const token = await getToken();
  let error = null;

  const blueprint = await axios
    .get(`${process.env.FLOWBUILD_URL}/workflows/${workflow_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => response.data)
    .catch((err) => {
      logger.debug(err.message);
      error = err.message;
    });

  return {
    blueprint,
    error,
  };
};

module.exports = {
  getWorkflowFromFlowbuild,
};
