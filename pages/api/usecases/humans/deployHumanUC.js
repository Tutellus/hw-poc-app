// deployHumanUC.js

const { config } = require("../../config");
const { ethers } = require("ethers");
const { abi: HumanFactoryAbi } = require("../../abi/HumanFactory.json");
const humansRepository = require("../../repositories/humans");
const shared = require("./shared");

export default async function handler(req, res) {
  const { user, owner } = req.body;
  const receipt = await execute({ user, owner });
  res.status(200).json({ receipt });
}

export async function execute({ user, owner }) {
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
      projectId,
    } = config["0x13881"];

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

    await humansRepository.update({
      id: address,
      fields: {
        email,
        projectId,
      },
    })

    const tx = await contract.deployHuman(
      federationOwners,
      safeSalt,
      defaultTimelock,
      owner,
      serverSigner.address,
      defaultInactivityTime,
      stringSalt,
    );
    const receipt = await tx.wait();

    await humansRepository.markAsExecuted(address);

    return receipt;
  } catch (error) {
    console.error(error)
    throw error;
  }
}