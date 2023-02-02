import { ethers } from "ethers";
import { config } from "../../config";
import { getOne as getProject } from "../../repositories/projects";
import { execute as executeTransaction } from '../../infrastructure/executor';

import ProxyForwardPolicies from "../../abi/ProxyForwardPoliciesMock.json"; 

export default async function handler (req, res) {
  const { projectId, chainId, address, status } = req.body;
  const response = await execute({ projectId, chainId, address, status });
  res.status(200).json({response});
}

export async function execute ({
  projectId,
  chainId,
  address,
  status,
}) {
  try {

    const project = await getProject({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }
    
    const { executorKey } = project;
    const { rpc, forwardPolicies } = config[chainId];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const executor = new ethers.Wallet(executorKey, provider);
    const forwardPoliciesInterface = new ethers.utils.Interface(ProxyForwardPolicies.abi);

    const receipt = await executeTransaction({
      to: forwardPolicies,
      data: forwardPoliciesInterface.encodeFunctionData('updateContract', [address, status]),
      value: 0,
      signer: executor,
    });
    
    return receipt;
    
  } catch (error) {
    console.error(error)
    throw error;
  }
}