// deployHumanUC.js

const { config } = require("../../config");
const { ethers } = require("ethers");
const { abi: HumanFactoryAbi } = require("../../abi/HumanFactory.json");
const humansRepository = require("../../repositories/humans");
const shared = require("./shared");
const executorInfra = require("../../infrastructure/executor");

export default async function handler(req, res) {
  const { chainId, projectId, user, owner } = req.body;
  const human = await execute({ chainId, projectId, user, owner });
  res.status(200).json({ human });
}

export async function execute({
  chainId,
  projectId,
  user,
  owner,
}) {
  try {
    const { email } = user;
    const safeSalt = parseInt(Date.now() / 1000);
    const {
      rpc,
      humanFactory,
      beacon,
      factorySigner,
      serverSigner,
      federationOwners,
      defaultTimelock,
      defaultInactivityTime,
    } = config[chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(factorySigner.kPriv, provider);
    const contract = new ethers.Contract(humanFactory, HumanFactoryAbi, signer);

    // concat and hash email and projectId
    const stringSalt = shared.getHumanSalt(email, projectId);
    const address = shared.getHumanAddressByStringSalt({
      humanFactory,
      beacon,
      stringSalt
    });

    const human = await humansRepository.update({
      fields: {
        address,
        email,
        projectId,
        chainId,
        stringSalt,
        user,
      },
    })

    executorInfra.execute({
      to: humanFactory,
      data: contract.interface.encodeFunctionData(
        'deployHuman',
        [
          federationOwners,
          safeSalt,
          defaultTimelock,
          owner,
          serverSigner.address,
          defaultInactivityTime,
          stringSalt,
        ]
      ),
      value: 0,
      signer,
    });

    const result = await humansRepository.markAsExecuted(human._id);
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}