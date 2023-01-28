import { ethers } from 'ethers';
import { config } from '../../config';
import { update as updateProposal } from '../../repositories/proposals';
import { getOne as getOneProxy } from '../../repositories/proxies';
import { getOne as getOneProject } from '../../repositories/projects';
import { wrapOwner } from '../../utils/proxy';
import { create } from '../../utils/safe';

export default async function handler(req, res) {
  const { user, destination, data, value, gas } = req.body;
  const response = await execute({ user, destination, data, value, gas });
  res.status(200).json(response)
}

export async function execute({ submital }) {
  try {

    console.log('submital', submital)

    const { chainId, projectId, proxyId } = submital;
    
    const proxy = await getOneProxy({ _id: proxyId });
    if (!proxy) {
      throw new Error('Proxy not found');
    }

    const project = await getOneProject({ _id: projectId });

    if (!project) {
      throw new Error('Project not found');
    }

    const { masterKeys, ownerKeys } = project;

    // TODO: Implement forward policies here if OWNER or MASTER (only owner now)
    const safe = proxy.ownerSafe;
    let signers;
    if (safe === proxy.ownerSafe) {
      signers = ownerKeys;
    } else if (safe === proxy.masterSafe) {
      signers = masterKeys;
    } else {
      throw new Error('Invalid proposal');
    }
    /////////////////////////////////////////////////////////////////////////////

    // Wraps data of submital
    const wrappedData = wrapOwner(submital);
    const data = {
      to: proxy.address,
      data: wrappedData,
      value: 0,
      operation: 0,
    };
  
    // Creates and signs the proposal once
    const { rpc } = config[chainId];  
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const signer0 = new ethers.Wallet(signers[0], provider)
    const result = await create({
      chainId,
      safe,
      data,
      signer: signer0,
    })  
    const signatures = [result.signature];

    // Adds first signature to the proposal and creates proposal in DB
    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const proposal = await updateProposal({
      fields: {
        ...result,
        submitalId: submital._id,
        projectId,
        chainId,
        proxyId,
        signatures,
        code2fa,
      },
    })

    return proposal;

  } catch (error) {
    console.error(error)
    throw error;
  }
}