import { GQLRepository } from "./repository.js"

export const contractSDK = {
  getContracts: async ({ uri, projectId, accessToken }) => {
    return GQLRepository.getContracts({ uri, projectId, accessToken })
  },
}
