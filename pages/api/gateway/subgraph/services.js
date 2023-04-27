// services.js
const { GraphQLClient } = require('graphql-request');
const { GET_HUMANS } = require('./queries');

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

module.exports = {
  getHumans,
};
