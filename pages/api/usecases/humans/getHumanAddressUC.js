// getHumanAddressUC.js

const { config } = require("../../config");
const shared = require("./shared");

export default async function handler(req, res) {
  try {
    const { chainId, projectId, user } = req.body;
    const response = await execute({ chainId, projectId, user });
    res.status(200).json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ chainId, projectId, user }) {
  try {
    const { email } = user;
    const { humanFactory, beacon } = config[chainId];
    const stringSalt = shared.getHumanSalt(email, projectId);
    const address = shared.getHumanAddressByStringSalt({
      humanFactory,
      beacon,
      stringSalt
    });
    return { address };
  } catch (error) {
    console.error(error)
    throw error;
  }
}