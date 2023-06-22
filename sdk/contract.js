import { GQLRepository } from "./repository"
import { ethers } from "ethers"

export const contractSDK = {
  checkContractAddress: async ({ address }) => {
    const result = await GQLRepository.checkContractAddress({
      address,
    })
    return result
  },

  checkContractData: async ({ address }) => {
    const method = "mint"
    const params = [
      ethers.constants.AddressZero.toString(),
      ethers.constants.One.toString(),
    ]
    const result = await GQLRepository.checkContractData({
      address,
      method,
      params,
    })

    return result
  },

  getContracts: async () => {
    const result = await GQLRepository.getContracts()
    return result
  },
}
