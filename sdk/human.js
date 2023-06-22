import { GQLRepository } from "./repository"

export const humanSDK = {
  requestPreUserOp: async ({
    projectId,
    title,
    calls,
    description,
    accessToken,
  }) => {
    const requestProposal = await GQLRepository.requestProposals({
      projectId,
      title,
      calls,
      description,
      accessToken,
    })
    return requestProposal
  },

  loadHumanAddress: async ({ projectId, user, accessToken }) => {
    if (user) {
      try {
        const { getHumanAddress } = await GQLRepository.getHumanAddress({
          projectId,
          accessToken,
        })

        return getHumanAddress.address
      } catch (error) {
        console.error(error)
      }
    }
  },

  loadUserOps: async ({ projectId, chainId, human, user }) => {
    if (human?.address) {
      try {
        const response = await fetch("/api/usecases/userOps/getUserOpsUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            params: {
              first: 1000,
              where: {
                projectId,
                chainId,
                sender: human.address,
              },
            },
            user,
          }),
        })
        const { userOps: innerUserOps } = await response.json()
        return innerUserOps
      } catch (error) {
        console.error(error)
      }
    }
  },

  loadHuman: async ({ projectId, chainId, user }) => {
    const email = user?.email
    if (email) {
      try {
        console.log("loadHuman", { email, chainId, projectId })
        const response = await fetch("/api/usecases/humans/getHumanByEmailUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, chainId, projectId }),
        })
        const { human: innerHuman } = await response.json()
        return innerHuman
      } catch (error) {
        console.error(error)
      }
    }
  },

  getPreUserOpHash: async ({ proposalId, accessToken }) => {
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

  signAndSubmitPreUserOp: async ({ proposalId, accessToken }) => {
    const hash = await humanSDK.getPreUserOpHash({
      proposalId,
      accessToken,
    })
    const signature = await humanSDK.signMessageFromOwner({
      web3Provider,
      message: hash,
    })
    await humanSDK.submitUserOp({
      preUserOpId,
      signature,
      user,
    })
  },

  submitUserOp: async ({ preUserOpId, signature, user }) => {
    const response = await fetch("/api/usecases/userOps/submitUserOpUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        signature,
        user,
      }),
    })
    const { userOp } = await response.json()
    return userOp
  },

  signMessageFromOwner: async ({ web3Provider, message }) =>
    await web3Provider.getSigner().signMessage(message),

  confirmPreUserOp: async ({ preUserOpId, code, user }) => {
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
        owner: owner || "0x08B3Ac53b3dc5Abe9039Fb42B2330728409e86A7",
        accessToken,
      })

      return response
    } catch (error) {
      console.error(error)
    }
  },
}
