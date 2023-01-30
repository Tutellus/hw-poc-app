import { getSafeData } from '../../utils/safe'
import { update as updateProposal, markAsExecuting } from '../../repositories/proposals';
import { execute as executeProposal } from './execute';

export async function execute({ proposal, signature }) {
  try {
    const signatures = proposal.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    let threshold;
    [proposal, { threshold }] = await Promise.all([
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
    if (signatures.length >= threshold) {
      proposal = await markAsExecuting(proposal._id)
      executeProposal({ proposalId: proposal._id })
    }
    return proposal;
  } catch (error) {
    console.error(error)
    throw error;
  }
}