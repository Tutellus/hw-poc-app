// getHumanByUserUC.js

const subgraphServices = require("../../gateway/subgraph/services");
const shared = require("./shared");
const { config } = require("../../config");
const humansRepository = require("../../repositories/humans");

export default async function handler(req, res) {
  try {
    const { user } = req.body;
    const human = await execute({ user });
    res.status(200).json({ human })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ user }) {
  try {
    const { email } = user;
    const { projectId } = config["0x13881"];
    const humanSalt = shared.getHumanSalt(email, projectId);

    const [humans, humanDB] = await Promise.all([
      subgraphServices.getHumans({
        where: {
          salt: humanSalt,
        },
      }),
      humansRepository.getOne({ email, projectId })
    ]);
    
    const humanSG = humans[0];

    const human = {
      ...humanDB,
      ...humanSG,
      status: humanSG ? "CONFIRMED" : humanDB.status,
    };

    return Object.keys(human).length ? human : null;
  } catch (error) {
    console.error(error)
    throw error;
  }
}