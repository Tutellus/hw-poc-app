import { GQLRepository } from "./repository"
import { ethers } from "ethers"

export const contractSDK = {
  checkContractAddress: async (CONTRACT) => {
    const result = await GQLRepository.checkContractAddress({
      address: CONTRACT?.address,
    })
    return result
  },

  checkContractData: async (CONTRACT) => {
    const method = "mint"
    const params = [
      ethers.constants.AddressZero.toString(),
      ethers.constants.One.toString(),
    ]
    const result = await GQLRepository.checkContractData({
      address: CONTRACT?.address,
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
