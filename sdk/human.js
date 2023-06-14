import { config } from "./config"
const { CONTRACT } = config

export const humanSDK = {
  requestPreUserOp: async ({
    projectId,
    chainId,
    address,
    method,
    params,
    value,
    user,
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
        method,
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

  loadHumanAddress: async ({ projectId, chainId, user }) => {
    if (user) {
      try {
        const response = await fetch("/api/usecases/humans/getHumanAddressUC", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId, chainId, user }),
        })
        const { address: innerAddress } = await response.json()
        return innerAddress
      } catch (error) {
        console.error(error)
      }
    }
  },
}
