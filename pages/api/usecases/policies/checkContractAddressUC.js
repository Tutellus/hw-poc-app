import { ethers } from 'ethers';
import { config } from '../../config';
import { getOne as getContract } from '../../repositories/contracts';

import HumanExecutePolicies from '../../abi/HumanExecutePolicies.json';

export default async function handler(req, res) {
  try {
    const { contractId } = req.body;
    const response = await execute({ contractId });
    res.status(200).json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ contractId }) {
  try {
    
    const contract = await getContract({ _id: contractId });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { chainId } = contract;

    const { rpc, forwardPolicies } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const forwardPoliciesContract = new ethers.Contract(forwardPolicies, HumanExecutePolicies.abi, provider);
    const result = await forwardPoliciesContract.checkContractAddress(contract.address);
    
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}