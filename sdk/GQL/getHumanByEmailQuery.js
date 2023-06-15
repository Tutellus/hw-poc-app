import { gql } from "graphql-request"

export const GET_HUMAN_BY_EMAIL_QUERY = gql`
  query GET_HUMAN_BY_EMAIL_QUERY($input: GetHumanByEmailInput!) {
    getHumanByEmail(input: $input) {
      __typename
      ... on HumanWithSG {
        _id
        address
        chainId
        email
        projectId
        status
        stringSalt
        userId

        nonce
        lastExecutionTime
      }
      ... on TypeError {
        message
      }
    }
  }
`
