import { GET_HUMAN_ADDRESS_QUERY, authFetcher } from "./GQL"

export const GQLRepository = {
  getHumanAddress: async ({ projectId }) => {
    const response = await authFetcher(GET_HUMAN_ADDRESS_QUERY, {
      input: {
        projectId,
      },
    })
    return response
  },
}
