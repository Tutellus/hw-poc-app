const { ethers } = require('ethers');
const { config } = require('../../config');
const { getOne: getContract } = require('../../repositories/contracts');
const HumanExecutePolicies = require( '../../abi/HumanExecutePolicies.json');

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
  value,
}) {
  try {
    
    const contract = await getContract({ _id: contractId });

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
    const address = contractInstance.address;
    const data = contractInstance.interface.encodeFunctionData(method, params)

    const result = await executePoliciesContract
      .executeCheckOwner(
        address,
        data,
        value,
      );

      console.log('executeCheckOwner', { result })
  
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}