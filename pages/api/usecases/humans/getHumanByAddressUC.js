// getHumanByAddressUC.js

const subgraphServices = require("../../gateway/subgraph/services");
const humansRepository = require("../../repositories/humans");

export default async function handler(req, res) {
  try {
    const { address, chainId } = req.body;
    const human = await execute({ address, chainId });
    res.status(200).json({ human })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ address, chainId }) {
  try {
    const [humans, humanDB] = await Promise.all([
      // Review: use chainId for selecting subgraph
      subgraphServices.getHumans({
        where: {
          address: address.toLowerCase(),
        },
      }),
      humansRepository.getOne({ address, chainId })
    ]);
    
    const humanSG = humans[0];

    const human = {
      ...humanSG,
      ...humanDB,
      status: humanSG ? "CONFIRMED" : humanDB?.status || "PENDING",
    };

    return Object.keys(human).length ? human : null;
  } catch (error) {
    console.error(error)
    throw error;
  }
}