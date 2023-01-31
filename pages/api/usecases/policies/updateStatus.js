import { ethers } from "ethers";
import { config } from "../../config";
import { getOne as getProject } from "../../repositories/projects";
import { execute as executeTransaction } from '../../infrastructure/executor';

import ProxyForwardPolicies from "../../abi/ProxyForwardPoliciesMock.json"; 

export default async function execute ({
  projectId,
  chainId,
  address,
  selectorAndParams, // encoded function data
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
      data: forwardPoliciesInterface
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