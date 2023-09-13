import { authFetcher } from "./authFetcher"
import { AUTHENTICATE_MUTATION } from "./GQL"

export const GQLService = {
  authenticateUser: async ({ email }) => {
    const { authenticate } = await authFetcher({
      query: AUTHENTICATE_MUTATION,
      variables: {
        input: {
          email,
        },
      },
    })
    return authenticate
  },
}
