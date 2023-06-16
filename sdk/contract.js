import { GQLRepository } from "./repository"

export const contractSDK = {
  checkContractAddress: async (CONTRACT) => {
    const result = await GQLRepository.getContractAddress({
      address: CONTRACT?.address,
    })
    return result
  },
}
