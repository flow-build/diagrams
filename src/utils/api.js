require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

const getToken = async () => {
  const existingToken = process.env.TOKEN;
  
  if (!existingToken || !jwt.verify(existingToken, '1234', (err) => err ? false : true)) {
    process.env.TOKEN = await axios.post(`${process.env.FLOWBUILD_URL}/token`)
      .then((response) => response.data.jwtToken)
      .catch((error) => {
        logger.error(error.message);
        return;
      });
    return process.env.TOKEN;
  } else {
    return existingToken;
  }
}

const flowbuildApi = axios.create({
  baseURL: process.env.FLOWBUILD_URL
});

module.exports = {
  flowbuildApi,
  getToken
}