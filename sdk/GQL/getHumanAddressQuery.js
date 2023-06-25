import { gql } from "graphql-request"

export const GET_HUMAN_ADDRESS_QUERY = gql`
  query GET_HUMAN_ADDRESS_QUERY {
    getHumanAddress {
      __typename
      ... on HumanWithSG {
          _id
          address
          owner
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
