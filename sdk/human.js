import { config } from "./config"
const { CONTRACT } = config

export const humanSDK = {
  requestPreUserOp: async ({
    human,
    user,
    projectId,
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
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        chainId: CONTRACT.chainId,
        address: CONTRACT.address,
        method,
        params,
        value,
        user,
      }),
    })
    const { preUserOp } = await response.json()
    humanSDK.loadPreUserOps({ human })
    return preUserOp
  },

  loadHuman: async ({ user }) => {
    const email = user?.email
    if (email) {
      try {
        console.log("loadHuman", {
          email,
          chainId: CONTRACT.chainId,
          projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
        })
        const response = await fetch("/api/usecases/humans/getHumanByEmailUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            chainId: CONTRACT.chainId,
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
          }),
        })
        const { human: innerHuman } = await response.json()
        return innerHuman
      } catch (error) {
        console.error(error)
      }
    }
  },

  loadHumanAddress: async ({ user }) => {
    if (user) {
      try {
        const response = await fetch("/api/usecases/humans/getHumanAddressUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
            chainId: CONTRACT.chainId,
            user,
          }),
        })
        const { address: innerAddress } = await response.json()
        return innerAddress
      } catch (error) {
        console.error(error)
      }
    }
  },

  loadUserOps: async ({ human, user }) => {
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
                projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
                chainId: CONTRACT.chainId,
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

  loadPreUserOps: async ({ human, user }) => {
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
                projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
                chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
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

  signMessageFromOwner: async ({ web3Provider, hash }) =>
    await web3Provider.getSigner().signMessage(hash),

  signAndSubmitPreUserOp: async ({
    web3Provider,
    user,
    preUserOpId,
    human,
  }) => {
    const hash = await humanSDK.getPreUserOpHash({
      preUserOpId,
      user,
    })
    const signature = await humanSDK.signMessageFromOwner({
      web3Provider,
      hash,
    })
    await humanSDK.submitUserOp({
      preUserOpId,
      signature,
      user,
      human,
    })
    await humanSDK.loadPreUserOps({ human })
  },

  submitUserOp: async ({ preUserOpId, signature, user, human }) => {
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
    humanSDK.loadUserOps({ human, user })
    return userOp
  },
}
