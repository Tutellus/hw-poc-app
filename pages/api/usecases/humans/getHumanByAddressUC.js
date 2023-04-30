// getHumanByAddressUC.js

const subgraphServices = require("../../gateway/subgraph/services");
const humansRepository = require("../../repositories/humans");

export default async function handler(req, res) {
  try {
    const { address } = req.body;
    const human = await execute({ address });
    res.status(200).json({ human })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ address }) {
  try {
    console.log('address', address)
    const [humans, humanDB] = await Promise.all([
      subgraphServices.getHumans({
        where: {
          address: address.toLowerCase(),
        },
      }),
      humansRepository.getOne({ _id: address })
    ]);
    
    console.log('humans', humans)
    console.log('humanDB', humanDB)

    const human = {
      status: 'NOT_CREATED',
      ...humanDB,
      ...humans[0],
    };

    return Object.keys(human).length ? human : null;
  } catch (error) {
    console.error(error)
    throw error;
  }
}