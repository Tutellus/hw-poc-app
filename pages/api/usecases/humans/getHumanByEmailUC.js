// getHumanByEmailUC.js

const shared = require("./shared");
const { config } = require("../../config");
const getHumanByAddressUC = require("./getHumanByAddressUC");

export default async function handler(req, res) {
  try {
    const { chainId, projectId, email } = req.body;
    const human = await execute({ chainId, projectId, email });
    res.status(200).json({ human })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ chainId, projectId, email }) {
  try {
    const humanSalt = shared.getHumanSalt(email, projectId);
    const { humanFactory, beacon } = config[chainId];
    const address = shared.getHumanAddressByStringSalt({
      humanFactory,
      beacon,
      stringSalt: humanSalt
    });

    const result = getHumanByAddressUC.execute({ chainId, address });
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}