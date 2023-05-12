// services.js
const { GraphQLClient } = require('graphql-request');
const {
  GET_HUMANS,
  GET_EXECUTIONS,
  GET_USER_OPERATION_REVERTEDS,
} = require('./queries');

async function fetcher({ query, variables = null }) {
  try {
    const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/tutellus/humanwallet-mumbai'; // TODO: add subgraph url
    const client = new GraphQLClient(SUBGRAPH_URL, {
      credentials: 'same-origin',
    });
    const response = await client.request(query, variables);
    return response;
  } catch (error) {
    throw error;
  }
}

const getHumans = async (variables) => {
  const { humans = [] } = await fetcher({ query: GET_HUMANS, variables });
  return humans;
};

const getExecutions = async (variables) => {
  const { executions = [] } = await fetcher({ query: GET_EXECUTIONS, variables });
  return executions;
};

const getUserOperationReverteds = async (variables) => {
  const { userOperationReverteds = [] } = await fetcher({ query: GET_USER_OPERATION_REVERTEDS, variables });
  return userOperationReverteds;
};

module.exports = {
  getHumans,
  getExecutions,
  getUserOperationReverteds,
};
