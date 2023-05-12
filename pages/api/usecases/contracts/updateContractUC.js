const { ethers } = require('ethers');
const { config } = require('../../config');
const contractsRepository = require('../../repositories/contracts');
const shared = require('./shared');

export default async function handler(req, res) {
  const { abi, address, chainId } = req.body;
  const contract = await execute({ abi, address, chainId });
  res.status(200).json({ contract })
}

export async function execute({
  abi,
  address,
  chainId,
}) {
  try {
    const { rpc } = config[chainId];

    if (!rpc) {
      throw new Error('Chain not supported');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpc);

    const {
      verified,
      isProxy,
      implementationAddress,
    } = await shared.verifyContract({
      provider,
      abi,
      address,
    })

    if (!verified) {
      throw new Error('Contract ABI not verified');
    }

    const result = await contractsRepository.update({
      fields: {
        abi,
        address,
        chainId,
        isProxy,
        implementationAddress,
      }
    });
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}