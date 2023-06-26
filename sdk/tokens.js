import { GQLRepository } from "./repository.js"

export const tokenSDK = {
  getTokensBalance: async ({ uri, address, tokens, projectId, accessToken }) => {
    return GQLRepository.getTokensBalance({
      uri,
      address,
      tokens,
      accessToken,
      projectId, 
    })
  },
}
