import { GQLRepository } from "./repository.js"

export const contractSDK = {
  checkContractAddress: async ({ uri, contractAddress, projectId, accessToken }) => {
    return GQLRepository.checkContractAddress({
      uri,
      contractAddress,
      accessToken,
      projectId, 
    })
  },

  checkContractData: async ({ uri, contractAddress, method, params, projectId, accessToken }) => {
    // TODO este calculo va fuera para que se pueda culsultar cualquier método
    // const method = "mint"
    // const params = [
    //   ethers.constants.AddressZero.toString(),
    //   ethers.constants.One.toString(),
    // ]

    return GQLRepository.checkContractData({
      uri, 
      contractAddress, 
      method, 
      params, 
      accessToken,
      projectId, 
    })
  },

  getContracts: async ({ uri, projectId, accessToken }) => {
    return GQLRepository.getContracts({ uri, projectId, accessToken })
  },

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
