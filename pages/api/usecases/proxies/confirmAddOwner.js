import { config } from '../../config.js'
import { ethers } from 'ethers'
import { update as updateProposal } from '../../repositories/proposals.js'
import { getOne as getProxy, update as updateProxy } from '../../repositories/proxies'
import { execute as confirmProposal } from '../proposals/confirm'
import { getOne as getProject } from '../../repositories/projects'
import { create, getSafeData, sign } from '../../utils/safe.js'

import Safe from '../../abi/GnosisSafe.json'

export default async function handler(req, res) {
  const { proxyId, code, user } = req.body
  const response = await execute({ proxyId, code, user })
  res.status(200).json(response)
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

    const { chainId, ownerSafe: safe, externalWallet, userId, projectId } = proxy;

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

    const { ownerKeys } = project;
    const { rpc } = config[chainId];

    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const owner0Wallet = new ethers.Wallet(ownerKeys[0], provider);
    const owner1Wallet = new ethers.Wallet(ownerKeys[1], provider);

    const safeInterface = new ethers.utils.Interface(Safe.abi);
    const { threshold } = await getSafeData({
      safe,
      chainId,
    });

    const originalData = safeInterface.encodeFunctionData(
      'addOwnerWithThreshold',
      [
        externalWallet.address,
        threshold,
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
      signer: owner0Wallet,
    });

    const { signature: signature0 } = sign({
      safe,
      chainId,
      ...tx,
      signer: owner0Wallet,
    })

    const { signature: signature1 } = sign({
      safe,
      chainId,
      ...tx,
      signer: owner1Wallet,
    })

    const signatures = [signature0];
    
    let proposal = await updateProposal({
      fields: {
        ...tx,
        projectId,
        chainId,
        proxyId,
        signatures,
      }
    });

    proposal = await confirmProposal({
      proposal,
      signature: signature1,
      awaitExecution: true,
    });

    await updateProxy({
      id: proxyId,
      fields: {
        externalWallet: {
          ...externalWallet,
          status: 'CONFIRMED',
          proposalId: proposal._id,
        }
      }
    })

  } catch (error) {
    console.error(error)
    return {
      error: 'Error'
    }
  }
}