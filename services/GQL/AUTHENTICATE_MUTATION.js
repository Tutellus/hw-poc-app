export const AUTHENTICATE_MUTATION = `
  mutation AUTHENTICATE_MUTATION($input: UserInput) {
    authenticate(input: $input) {
      __typename
      ... on AuthPayload {
        user {
          _id
          email
          roles
          attempts
        }
        token
        refreshToken
        tokenExpiry
      }
      ... on Error {
        code
        message
        description
      }
    }
  }
`
