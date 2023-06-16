import {
  GET_HUMAN_ADDRESS_QUERY,
  GET_HUMAN_BY_EMAIL_QUERY,
  CHECK_CONTRACT_ADDRESS_QUERY,
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

  getContractAddress: async ({ address }) => {
    if (!address) return
    const response = await authFetcher(CHECK_CONTRACT_ADDRESS_QUERY, {
      contractAddress: {
        address,
      },
    })
    console.log({ response })
    return response
  },
}
