import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateProposal } from '../../repositories/proposals.js'
import { getOne as getProxy, update as updateProxy } from '../../repositories/proxies'
import { execute as confirm } from '../proposals/confirm'
import { getOne as getProject } from '../../repositories/projects'
import { create, sign } from '../../utils/safe.js'

import Safe from '../../abi/Safe.json'

export default async function handler(req, res) {
  const { proxyId, code, user } = req.body
  const proposal = await execute({ proxyId, code, user })
  res.status(200).json({ proposal })
}

export async function execute({
  proxyId,
  code,
  user,
}) {
  try {
    // Check if the Proxy exists
    const proxy = await getProxy({ _id: proxyId })
    if(!proxy) {
      throw new Error('Proxy not found')
    }

    const { chainId, masterSafe: safe, externalWallet, userId, projectId } = proxy;

    // Check if the user is the owner of the Proxy
    if (userId !== user._id) {
      throw new Error('User not authorized')
    }

    // Check if the address is valid
    const canAddOwner = externalWallet.address && externalWallet.status === 'PENDING'
    if (!canAddOwner) {
      throw new Error('Invalid address')
    }

    // Check if the code is valid
    if (externalWallet.code2fa !== code) {
      throw new Error('Invalid code')
    }

    const project = await getProject({ _id: projectId });
    if (!project) {
      throw new Error('Project not found')
    }
    
    // Create tx

    const { masterKeys } = project;
    const { rpc } = config[chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const master0Wallet = new ethers.Wallet(masterKeys[0], provider);
    const master1Wallet = new ethers.Wallet(masterKeys[1], provider);

    const safeInterface = new ethers.utils.Interface(Safe.abi);
    const originalData = safeInterface.encodeFunctionData(
      'addOwnerWithThreshold',
      [
        externalWallet.address,
        2, // threshold (previously using getSafeData)
      ]
    );

    const data = {
      to: safe,
      value: 0,
      data: originalData,
      operation: 0,
    }

    const tx = await create({
      chainId,
      safe,
      data,
      signer: master0Wallet,
    });

    const { signature: signature0 } = sign({
      safe,
      chainId,
      ...tx,
      signer: master0Wallet,
    })

    const { signature: signature1 } = sign({
      safe,
      chainId,
      ...tx,
      signer: master1Wallet,
    })

    const signatures = [signature0];
    
    let proposal = await updateProposal({
      fields: {
        ...tx,
        projectId,
        chainId,
        proxyId,
        signatures,
        code2fa: externalWallet.code2fa,
      }
    });

    proposal = await confirm({
      proposal,
      signature: signature1,
      awaitExecution: true,
    })

    if (proposal.status === 'EXECUTED') {
      await updateProxy({
        id: proxyId,
        fields: {
          externalWallet: {
            ...externalWallet,
            status: 'CONFIRMED',
            proposalId: proposal._id,
          }
        }
      });
    }
  
    return proposal;
  } catch (error) {
    console.error(error)
    throw error;
  }
}