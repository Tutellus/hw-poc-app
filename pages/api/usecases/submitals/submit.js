import { getOne as getContract } from '../../repositories/contracts';
import { getOne as getProject } from '../../repositories/projects';
import { markAsProcessing, update as updateSubmital } from '../../repositories/submitals';
import { getOne as getProxy } from '../../repositories/proxies';
import { execute as createProposal } from '../proposals/create';
import { execute as process } from '../contracts/process';

export default async function handler(req, res) {
  try {
    const {
      chainId,
      contractId,
      projectId,
      method,
      params,
      value,
      user,
    } = req.body;
    const response = await execute({
      chainId,
      contractId,
      projectId,
      method,
      params,
      value,
      user
    });
    res.status(200).json({ response })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }

}

export async function execute({
  chainId,
  contractId,
  method,
  params,
  value,
  projectId,
  user,
}) {
  try {

    const { _id: userId } = user;

    // Gets contract
    const project = await getProject({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    // Gets proxy depending on user and chainId
    const proxy = await getProxy({
      userId,
      chainId,
      projectId,
    });

    if (!proxy) {
      throw new Error('Proxy not found');
    }

    const { _id: proxyId, address: proxyAddress } = proxy;

    const contractDataBatch = await Promise.all(contractId.map(async (innerContractId, index) => {
      const contract = await getContract({ _id: innerContractId });

      if (!contract) {
        throw new Error('Contract not found');
      }

      const { chainId: innerChainId } = contract;

      // Check chainId is common
      if (chainId !== innerChainId) {
        throw new Error('All contracts must match the proxy chain');
      }

      const contractData = await process({
        contract,
        method: method[index],
        params: params[index],
        value: value[index],
        proxyAddress,
      })

      if(!contractData) {
        throw new Error('Cannot process contract data');
      }

      const { to, value: innerValue, gas, data } = contractData;

      return {
        contractId,
        chainId,
        to,
        data,
        value: innerValue,
        gas,
      }

    }));

    // Creates a submital
    const {
      to,
      data,
      value: innerValue,
      gas,
    } = contractDataBatch.reduce((acc, data) => {
      acc.to.push(data.to);
      acc.data.push(data.data);
      acc.value.push(data.value);
      acc.gas.push(data.gas);
      return acc;
    }, {
      to: [],
      data: [],
      value: [],
      gas: [],
    });
    
    const submital = await updateSubmital({
      fields: {
        proxyId,
        userId,
        chainId,
        projectId,
        contractId,
        to,
        data,
        value: innerValue,
        gas,
      }
    });

    if (!submital) {
      throw new Error('Cannot create submital');
    }

    const { _id: submitalId } = submital;
    
    // Marks submital as processing
    await markAsProcessing(submitalId);

    // Creates a proposal
    const proposal = await createProposal({
      submital,
      proxy,
      project,
    })
    return proposal;

  } catch (error) {
    console.error(error)
    throw error;
  }
}