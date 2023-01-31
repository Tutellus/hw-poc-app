import { ethers } from 'ethers';
import { config } from '../../config';
import { getOne as getContract } from '../../repositories/contracts';
import { getOne as getProxy } from '../../repositories/proxies';

import ProxyForwardPolicies from '../../abi/ProxyForwardPoliciesMock.json';

export default async function handler(req, res) {
  try {
    const { contractId, proxyId, method, params, value } = req.body;
    const response = await execute({
      contractId,
      proxyId,
      method,
      params,
      value,
    });
    res.status(200).json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({
  contractId,
  proxyId,
  method,
  params,
  value,
}) {
  try {
    
    const proxy = await getProxy({ _id: proxyId });

    if (!proxy) {
      throw new Error('Proxy not found');
    }
  
    const contract = await getContract({ _id: contractId });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { chainId } = contract;

    if (chainId !== proxy.chainId) {
      throw new Error('Proxy and contract must be on the same chain');
    }

    const { rpc, forwardPolicies } = config[chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const forwardPoliciesContract = new ethers.Contract(forwardPolicies, ProxyForwardPolicies.abi, provider);

    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);
    const gas = await contractInstance.estimateGas[method](...params, { from: proxy.address });

    const result = await forwardPoliciesContract
      .forwardCheckOwner(
        contract.address,
        contractInstance.interface.encodeFunctionData(method, params),
        value,
        gas,
      );
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}