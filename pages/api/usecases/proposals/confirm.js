import { getSafeData } from '../../utils/safe'
import { update as updateProposal, markAsProcessing } from '../../repositories/proposals';

export async function execute({ proposal, signature }) {
  try {
    const signatures = proposal.signatures || [];
    if (!signatures.includes(signature)) {
      signatures.push(signature);
    }

    let threshold;
    [proposal, { threshold, nonce }] = await Promise.all([
      updateProposal({
        id: proposal._id,
        fields: {
          signatures,
        }
      }),
      getSafeData(proposal.safe),
    ])

    // Check if the transaction has enough signatures and try execute (nonce?)
    if (signatures.length >= threshold) {
      proposal = await markAsProcessing(proposal._id)
      // add to executor...
    }
    return proposal;
  } catch (error) {
    console.error(error)
    return {};
  }
}