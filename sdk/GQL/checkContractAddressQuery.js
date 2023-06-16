import { gql } from "graphql-request"

export const CHECK_CONTRACT_ADDRESS_QUERY = gql`
  query CHECK_CONTRACT_ADDRESS_QUERY($contractAddress: String!) {
    checkContractAddress(contractAddress: $contractAddress) {
      __typename
      ... on GenericResult {
        result
      }
      ... on TypeError {
        message
      }
    }
  }
`
