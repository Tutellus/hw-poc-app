import {
  GET_HUMAN_ADDRESS_QUERY,
  GET_HUMAN_BY_EMAIL_QUERY,
  CHECK_CONTRACT_ADDRESS_QUERY,
  CHECK_CONTRACT_DATA_QUERY,
  authFetcher,
} from "./GQL"

export const GQLRepository = {
  getHumanAddress: async ({ projectId }) => {
    const response = await authFetcher(GET_HUMAN_ADDRESS_QUERY, {
      input: {
        projectId,
      },
    })
    return response
  },

  getHumanByEmail: async ({ projectId, email }) => {
    const response = await authFetcher(GET_HUMAN_BY_EMAIL_QUERY, {
      input: {
        projectId,
        email,
      },
    })
    return response
  },

  checkContractAddress: async ({ address }) => {
    if (!address) return
    const response = await authFetcher(CHECK_CONTRACT_ADDRESS_QUERY, {
      contractAddress: {
        address,
      },
    })
    return response
  },

  checkContractData: async ({ address, method, params }) => {
    const { checkContractData } = await authFetcher(CHECK_CONTRACT_DATA_QUERY, {
      input: {
        contractAddress: address,
        method,
        params,
      },
    })
    return checkContractData.result
  },
}
