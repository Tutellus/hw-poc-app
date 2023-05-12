const { ethers } = require("ethers");
const { config } = require("../../config");
const HumanExecutePolicies = require("../../abi/HumanExecutePolicies.json");
const contractsRepository = require("../../repositories/contracts");

export default async function handler(req, res) {
  try {
    const { contractId, method } = req.body;
    const mask = await execute({
      contractId,
      method,
    });
    res.status(200).json({ mask })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export async function execute({
  contractId,
  method,
}) {
  try {
    
    const contract = await contractsRepository.getOne({ _id: contractId });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { rpc, executePolicies } = config[contract.chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executePoliciesContract = new ethers.Contract(executePolicies, HumanExecutePolicies.abi, provider);

    const contractInterface = new ethers.utils.Interface(contract.abi);
    const selector = contractInterface.getSighash(method);

    const mask = await executePoliciesContract
      .getMask(
        contract.address,
        selector,
      );
  
    return mask;
  } catch (error) {
    console.error(error)
    throw error;
  }
}