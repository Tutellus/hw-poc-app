import { GQLRepository } from "./repository"

export const humanSDK = {
  requestProposal: async ({
    projectId,
    title,
    calls,
    description,
    accessToken,
  }) => {
    const response = await GQLRepository.requestProposals({
      projectId,
      title,
      calls,
      description,
      accessToken,
    })
    return response
  },

  getHumanAddress: async ({ projectId, accessToken }) => {
    try {
      const response = await GQLRepository.getHumanAddress({
        projectId,
        accessToken,
      })

      return response
    } catch (error) {
      console.error(error)
    }
  },

  getProposals: async ({ projectId, accessToken }) => {
    try {
      const getProposals = await GQLRepository.getProposals({
        projectId,
        accessToken,
      })

      return getProposals
    } catch (error) {
      console.error(error)
    }
  },

  loadHuman: async ({ projectId, accessToken }) => {
    try {
      const innerHuman = await GQLRepository.getHumanAddress({
        projectId,
        accessToken,
      })
      return innerHuman
    } catch (error) {
      console.error(error)
    }
  },

  getProposalsHash: async ({ proposalId, accessToken }) => {
    try {
      const hash = await GQLRepository.getProposalsHash({
        proposalId,
        accessToken,
      })

      return hash
    } catch (error) {
      console.error(error)
    }
  },

  signAndSubmitProposal: async ({ proposalId, accessToken, web3Provider }) => {
    if (!proposalId) return
    debugger
    const hash = await humanSDK.getProposalsHash({
      proposalId,
      accessToken,
    })
    const signature = await humanSDK.signMessageFromOwner({
      web3Provider,
      message: hash,
    })
    await humanSDK.processProposal({
      proposalId,
      signature,
      accessToken,
    })
  },

  processProposal: async ({ proposalId, signature, accessToken }) => {
    const response = await GQLRepository.processProposal({
      proposalId,
      signature,
      accessToken,
    })
    return response
  },

  signMessageFromOwner: async ({ web3Provider, message }) =>
    await web3Provider.getSigner()._signingKey(message),

  confirmProposal: async ({ preUserOpId, code, user }) => {
    const response = await fetch("/api/usecases/userOps/confirmPreUserOpUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        code,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    return preUserOp
  },

  deployHuman: async ({ projectId, owner, accessToken }) => {
    try {
      const response = await GQLRepository.deployHuman({
        projectId,
        owner,
        accessToken,
      })

      return response
    } catch (error) {
      console.error(error)
    }
  },
}
