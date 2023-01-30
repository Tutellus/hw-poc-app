import { ethers } from 'ethers'
import { getSafeData } from '../../utils/safe'
import { getOne as getProposal } from '../../repositories/proposals';
import { getOne as getProxy } from '../../repositories/proxies';
import { execute as confirm } from './confirm';

export default async function handler(req, res) {
  const { proposalId, signature, user } = req.body;
  const response = await execute({ proposalId, signature, user });
  res.status(200).json(response)
}

async function execute({ proposalId, signature, user }) {
  try {

    // Check if the transaction exists and if it is in a pending state
    const proposal = await getProposal({ _id: proposalId })
    if (!proposal || proposal.status !== 'PENDING') {
      throw new Error('Proposal not signable')
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

    // Check if the signature is valid
    const sender = ethers.utils.recoverAddress(proposal.contractTransactionHash, signature)
    const safeData = await getSafeData(proposal.safe)
    const lcOwners = safeData.owners.map(owner => owner.toLowerCase())
    if (!lcOwners.includes(sender.toLowerCase())) {
      throw new Error('Invalid signature')
    }

    // Confirm the transaction
    const result = await confirm({ proposal, signature })
    return result;
  } catch (error) {
    console.error(error)
    throw error;
  }
}