import { ethers } from 'ethers'
import { getOne as getProposal } from '../../repositories/proposals';
import { getOne as getProxy } from '../../repositories/proxies';
import { getOne as getProject } from '../../repositories/projects';
import { execute as confirm } from './confirm';
import { sign } from '../../utils/safe';

export default async function handler(req, res) {
  const { proposalId, code, user } = req.body;
  const response = await execute({ proposalId, code, user });
  res.status(200).json({ proposal: response })
}

async function execute({ proposalId, code, user }) {
  try {

    // Check if the transaction exists and if it is in a pending state
    const proposal = await getProposal({ _id: proposalId })
    if (!proposal || proposal.status !== 'PENDING') {
      throw new Error('Proposal not signable')
    }

    // Check if the code is valid
    if (proposal.code2fa !== code) {
      throw new Error('Invalid code')
    }

    // Check if the Proxy exists
    const proxy = await getProxy({ _id: proposal.proxyId })
    if (!proxy) {
      throw new Error('Proxy not found')
    }

    // Check if the user is the owner of the Proxy
    if (proxy.userId !== user._id) {
      throw new Error('User not authorized')
    }

    const project = await getProject({ _id: proxy.projectId })
    if (!project) {
      throw new Error('Project not found')
    }

    // Signing
    const { ownerKeys } = project;
    const owner1Wallet = new ethers.Wallet(ownerKeys[1]) 

    const { signature } = sign({
      ...proposal,
      signer: owner1Wallet,
    })

    // Confirm the transaction
    const result = await confirm({ proposal, signature });
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}