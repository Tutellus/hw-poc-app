import { getSafeData } from '../../utils/safe'
import { update as updateProposal, markAsExecuting } from '../../repositories/proposals';
import { execute as executeProposal } from './execute';

export async function execute({ proposal, signature, awaitExecution = false }) {
  try {
    const signatures = proposal.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    let threshold, nonce;
    [proposal, { threshold, nonce }] = await Promise.all([
      updateProposal({
        id: proposal._id,
        fields: {
          signatures,
        }
      }),
      getSafeData({
        safe: proposal.safe,
        chainId: proposal.chainId,
      }),
    ])

    // Check if the transaction has enough signatures and try execute (nonce?)
    if (signatures.length >= threshold && nonce === proposal.nonce) {
      proposal = await markAsExecuting(proposal._id)
      if (awaitExecution) {
        await executeProposal({ proposalId: proposal._id })
      } else {
        executeProposal({ proposalId: proposal._id })
      }
    }
    return proposal;
  } catch (error) {
    console.error(error)
    throw error;
  }
}