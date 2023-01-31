import { ethers } from 'ethers';
import { config } from '../../config';
import { update as updateProposal } from '../../repositories/proposals';
import { wrapMaster, wrapOwner } from '../../utils/proxy';
import { create } from '../../utils/safe';
import { execute as confirm } from './confirm';

import ProxyForwardPolicies from '../../abi/ProxyForwardPoliciesMock.json';

export async function execute({
  proxy,
  project,
  submital,
}) {
  try {
    
    const { chainId } = proxy;
    const { masterKeys, ownerKeys } = project;
    const { rpc, forwardPolicies } = config[chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const forwardPoliciesContract = new ethers.Contract(forwardPolicies, ProxyForwardPolicies.abi, provider);

    const forwardCheckOwner = await forwardPoliciesContract
      .forwardCheckOwner(
        submital.to,
        submital.data,
        submital.value,
        submital.gas,
      );
    
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