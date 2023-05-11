const { ethers } = require("ethers");
const { config } = require("../../config");
const projectsRepository = require("../../repositories/projects");
const executorInfra = require('../../infrastructure/executor');

const HumanExecutePolicies = require("../../abi/HumanExecutePolicies.json");

export default async function handler (req, res) {
  const { projectId, chainId, address, selectorAndParams, status } = req.body;
  const response = await execute({ projectId, chainId, address, selectorAndParams, status });
  res.status(200).json({response});
}

export async function execute ({
  projectId,
  chainId,
  address,
  selectorAndParams,
  status,
}) {
  try {
    const project = await projectsRepository.getOne({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }
    
    const { rpc, executePolicies, factorySigner } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executor = new ethers.Wallet(factorySigner.kPriv, provider);
    const executePoliciesInterface = new ethers.utils.Interface(HumanExecutePolicies.abi);

    const receipt = await executorInfra.execute({
      to: executePolicies,
      data: executePoliciesInterface
        .encodeFunctionData(
          'updateIdStatus',
          [address, selectorAndParams, status]
        ),
      value: 0,
      signer: executor,
    });
    
    return receipt;
    
  } catch (error) {
    console.error(error)
    throw error;
  }
}