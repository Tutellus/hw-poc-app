import { GQLRepository } from "./repository.js"

export const humanSDK = {
  getAddress: async ({ provider }) => {
    const signer = await provider.getSigner();
    return signer.getAddress()
  },

  getHumanAddress: async ({ uri, projectId, accessToken }) => {
    return GQLRepository.getHumanAddress({
      uri,
      accessToken,
      projectId,
    })
  },

  deployHuman: async ({ uri, provider, accessToken, projectId }) => {
    const owner = await humanSDK.getAddress({ provider })
    return GQLRepository.deployHuman({
      uri,
      owner,
      accessToken,
      projectId,
    })
  },
}
