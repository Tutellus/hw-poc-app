import { GQLRepository } from "./repository.js"

export const policySDK = {
  checkContractAddress: async ({ uri, contractAddress, projectId, accessToken }) => {
    return GQLRepository.checkContractAddress({
      uri,
      contractAddress,
      accessToken,
      projectId, 
    })
  },

  updateContractStatus: async ({ uri, contractAddress, status, projectId, accessToken }) => {
    return GQLRepository.updateContractStatus({
      uri,
      contractAddress,
      status,
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
}
