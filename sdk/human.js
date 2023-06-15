import { config } from "./config"
import { GQLRepository } from "./repository"

const { CONTRACT } = config

export const humanSDK = {
  requestPreUserOp: async ({
    projectId,
    chainId,
    address,
    user,
    method,
    params,
    value,
  }) => {
    const response = await fetch("/api/usecases/userOps/requestPreUserOpUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        chainId,
        address,
        method: method || "POST",
        params,
        value,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    return preUserOp
  },

  loadPreUserOps: async ({ projectId, chainId, human, user }) => {
    if (human?._id) {
      try {
        const response = await fetch("/api/usecases/userOps/getPreUserOpsUC", {
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
                humanId: human._id,
              },
            },
            user,
          }),
        })
        const { preUserOps: innerPreUserOps } = await response.json()
        return innerPreUserOps
      } catch (error) {
        console.error(error)
      }
    }
  },

  loadHumanAddress: async ({ projectId, user }) => {
    if (user) {
      try {
        const { getHumanAddress } = await GQLRepository.getHumanAddress({
          projectId,
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

  getPreUserOpHash: async ({ preUserOpId, user }) => {
    const response = await fetch("/api/usecases/userOps/getPreUserOpHashUC", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preUserOpId,
        user,
      }),
    })
    const { hash } = await response.json()
    return hash
  },

  signAndSubmitPreUserOp: async ({ web3Provider, preUserOpId, user }) => {
    const hash = await humanSDK.getPreUserOpHash({
      preUserOpId,
      user,
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

  confirmPreUserOp: async ({ preUserOpId, code }) => {
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
    loadPreUserOpsData()
    return preUserOp
  },

  deployHuman: async ({ projectId, chainId, user, externalAccount }) => {
    if (user && externalAccount) {
      try {
        const response = await fetch("/api/usecases/humans/deployHumanUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            chainId,
            user,
            owner: externalAccount,
          }),
        })
        const { human } = await response.json()
        return human
      } catch (error) {
        console.error(error)
      }
    }
  },
}
