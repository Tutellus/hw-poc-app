import { ethers } from 'ethers';
import { config } from '../../config';
import { getOne as getContract } from '../../repositories/contracts';

import ProxyForwardPolicies from '../../abi/ProxyForwardPoliciesMock.json';

export default async function handler(req, res) {
  try {
    const { contractId, method, params } = req.body;
    const response = await execute({
      contractId,
      method,
      params,
    });
    res.status(200).json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({
  contractId,
  method,
  params,
}) {
  try {
    
    const contract = await getContract({ _id: contractId });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { rpc, forwardPolicies } = config[contract.chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const forwardPoliciesContract = new ethers.Contract(forwardPolicies, ProxyForwardPolicies.abi, provider);

    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);

    const result = await forwardPoliciesContract
      .checkContractData(
        contract.address,
        contractInstance.interface.encodeFunctionData(method, params),
      );
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}