import { ethers } from 'ethers';
import { config } from '../../config';
import { update as updateContract } from '../../repositories/contracts';
import { verifyContract } from '../../utils/contract';

export default async function handler(req, res) {
  const { contractId, abi, address, chainId } = req.body;
  const contract = await execute({ contractId, abi, address, chainId });
  res.status(200).json({ contract })
}

export async function execute({
  contractId,
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
    } = await verifyContract({
      provider,
      abi,
      address,
    })

    if (!verified) {
      throw new Error('Contract ABI not verified');
    }

    const contract = await updateContract({
      id: contractId,
      fields: {
        abi,
        address,
        chainId,
        isProxy,
        implementationAddress,
      }
    });
    return contract;
  
  } catch (error) {
    console.error(error)
    throw error;
  }
}