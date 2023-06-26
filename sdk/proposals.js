import { ethers } from "ethers"
import { GQLRepository } from "./repository.js"

export const proposalSDK = {

  isSignable: (proposal) => proposal && proposal.status === "SIGNABLE",

  processIfSignable: async ({ uri, proposal, provider, accessToken, projectId }) => {
    if (proposalSDK.isSignable(proposal)) {
      console.log('\n>>>>>>\n PROPOSAL IS SIGNABLE', "\n>>>>>>\n")
      // Launch without await for confirmation
      proposalSDK.signAndProcessProposal({
        uri,
        proposalId: proposal._id,
        provider,
        accessToken, 
        projectId,
      })
    }
  },

  getProposals: async ({ uri, accessToken, projectId }) => {
    return GQLRepository.getProposals({
      uri, 
      projectId,
      accessToken,
    })
  },

  getProposalsHash: async ({ uri, proposalId, accessToken, projectId }) => {
    return GQLRepository.getProposalsHash({
      uri,
      proposalId,
      accessToken,
      projectId,
    })
  },

  requestProposal: async ({
    uri,
    title,
    description,
    calls,
    provider,
    accessToken,
    projectId,
  }) => {
    const proposal = await GQLRepository.requestProposals({
      uri,
      title,
      description,
      calls,
      accessToken,
      projectId,
    })
    proposalSDK.processIfSignable({
      uri, 
      proposal, 
      provider, 
      accessToken, 
      projectId
    })
    return proposal

  },

  signAndProcessProposal: async ({ uri, proposalId, provider, accessToken, projectId }) => {
    if (!proposalId) return

    const { hash } = await proposalSDK.getProposalsHash({
      uri,
      proposalId,
      accessToken,
      projectId,
    })
    console.log('\n>>>>>>\n HASH:', hash, "\n>>>>>>\n")

    const signature = await proposalSDK.signMessageFromOwner({
      provider,
      message: hash,
    })
    console.log('\n>>>>>>\n SIGNATURE:', signature, "\n>>>>>>\n")

    return proposalSDK.processProposal({
      uri,
      proposalId,
      signature,
      accessToken,
      projectId,
    })
  },

  processProposal: async ({ uri, proposalId, signature, accessToken, projectId }) => {
    return GQLRepository.processProposal({
      uri,
      proposalId,
      signature,
      accessToken,
      projectId,
    })
  },

  signMessageFromOwner: async ({ provider, message }) => {
    const signer = await provider.getSigner();
    return signer.signMessage(ethers.utils.arrayify(message))
  },

  confirmProposal: async ({ uri, proposalId, code, provider, accessToken, projectId }) => {
    const proposal = await GQLRepository.confirmProposal({
      uri,
      proposalId,
      code,
      accessToken,
      projectId,
    })

    proposalSDK.processIfSignable({
      uri, 
      proposal, 
      provider, 
      accessToken, 
      projectId
    })

    return proposal
  },

}
