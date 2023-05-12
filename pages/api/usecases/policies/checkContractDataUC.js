const { ethers } = require('ethers');
const { config } = require('../../config');
const contractsRepository = require('../../repositories/contracts');
const HumanExecutePolicies = require( '../../abi/HumanExecutePolicies.json');

export default async function handler(req, res) {
  try {
    const { chainId, address, method, params } = req.body;
    const response = await execute({
      chainId,
      address,
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
  chainId,
  address,
  method,
  params,
}) {
  try {
  
    const contract = await contractsRepository.getOne({ chainId, address });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { rpc, executePolicies } = config[contract.chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executePoliciesContract = new ethers.Contract(executePolicies, HumanExecutePolicies.abi, provider);

    const contractInstance = new ethers.Contract(contract.address, contract.abi, provider);
    const data = contractInstance.interface.encodeFunctionData(method, params)

    const result = await executePoliciesContract
      .checkContractData(
        address,
        data,
      );
  
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}