import { getOne as getOneContract } from '../../repositories/contracts';
import { markAsProcessing, update as updateSubmital } from '../../repositories/submitals';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { execute as createProposal } from '../proposals/create';
import { execute as process } from '../contracts/process';

export default async function handler(req, res) {
  try {
    const {
      contractId,
      projectId,
      method,
      params,
      value,
      user,
    } = req.body;
    const response = await execute({
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
  contractId,
  projectId,
  method,
  params,
  value,
  user,
}) {
  try {

    const { _id: userId } = user;

    // Gets contract
    const contract = await getOneContract({ _id: contractId });
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'LOCKED') {
      throw new Error('Contract locked');
    }

    const { chainId } = contract;

    // Gets proxy depending on user and chainId
    const proxy = await getOneProxy({
      userId,
      chainId,
      projectId,
    });

    if (!proxy) {
      throw new Error('Proxy not found');
    }

    const { _id: proxyId, address: proxyAddress } = proxy;

    // Processes data
    const contractData = await process({
      contract,
      method,
      params,
      value,
      proxyAddress,
    })

    if(!contractData) {
      throw new Error('Cannot process contract data');
    }

    const { to, value: innerValue, gas, data } = contractData;

    // Creates a submital
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
    const proposal = await createProposal({ submital })
    return proposal;

  } catch (error) {
    console.error(error)
    throw error;
  }
}