const { ethers } = require('ethers');
const { config } = require('../../config');
const { getOne: getContract } = require('../../repositories/contracts');
const HumanExecutePolicies = require( '../../abi/HumanExecutePolicies.json');

export default async function handler(req, res) {
  try {
    const { chainId, address } = req.body;
    const response = await execute({ chainId, address });
    res.status(200).json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({ chainId, address }) {
  try {
    
    const contract = await getContract({ chainId, address });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { rpc, executePolicies } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executePoliciesContract = new ethers.Contract(executePolicies, HumanExecutePolicies.abi, provider);
    const result = await executePoliciesContract.checkContractAddress(contract.address);
    
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}