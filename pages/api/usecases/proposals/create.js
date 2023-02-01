import { ethers } from 'ethers';
import { config } from '../../config';
import { update as updateProposal } from '../../repositories/proposals';
import { wrapMaster, wrapOwner } from '../../utils/proxy';
import { create } from '../../utils/safe';
import { execute as confirm } from './confirm';

import ProxyForwardPolicies from '../../abi/ProxyForwardPoliciesMock.json';

async function checkForward (
  submital,
) {

  const { chainId } = submital;
  const { rpc, forwardPolicies } = config[chainId];

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const forwardPoliciesContract = new ethers.Contract(forwardPolicies, ProxyForwardPolicies.abi, provider);

  const checks = await Promise.all(submital.to.map(async (to, index) => {
    const data = submital.data[index];
    const value = submital.value[index];
    const gas = submital.gas[index];
    
    const forwardCheckOwner = await forwardPoliciesContract
      .forwardCheckOwner(
        to,
        data,
        value,
        gas,
      );
    return forwardCheckOwner;
  }))

  const state = checks.every(check => check);
  return state;
}


export async function execute({
  proxy,
  project,
  submital,
}) {
  try {
    
    const { chainId } = proxy;
    const { masterKeys, ownerKeys } = project;

    const forwardCheckOwner = await checkForward(submital);
    
    let safe, signers, wrappedData;

    if (forwardCheckOwner) {
      safe = proxy.ownerSafe;
      signers = ownerKeys;
      wrappedData = wrapOwner(submital);
    } else {
      safe = proxy.masterSafe;
      signers = masterKeys;
      wrappedData = wrapMaster(submital);
    }

    const data = {
      to: proxy.address,
      data: wrappedData,
      value: 0,
      operation: 0,
    };
  
    const signer0 = new ethers.Wallet(signers[0], provider)
    const result = await create({
      chainId,
      safe,
      data,
      signer: signer0,
    })  

    // Adds first signature to the proposal and creates proposal in DB
    const code2fa = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const proposal = await updateProposal({
      fields: {
        ...result,
        userId: submital.userId,
        submitalId: submital._id,
        projectId: project._id,
        chainId,
        proxyId: proxy._id,
        code2fa,
      },
    })

    confirm({ proposal, signature: result.signature })
    return proposal;

  } catch (error) {
    console.error(error)
    throw error;
  }
}