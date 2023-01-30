import { ethers } from 'ethers';
import { config } from '../../config';
import { update as updateProposal } from '../../repositories/proposals';
import { wrapOwner } from '../../utils/proxy';
import { create } from '../../utils/safe';

export async function execute({
  proxy,
  project,
  submital,
}) {
  try {
    
    const { chainId } = proxy;
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
    const wrappedData = wrapOwner(submital); // TODO: Implement forward policies here if OWNER or MASTER (only owner now)
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
        projectId: project._id,
        chainId,
        proxyId: proxy._id,
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