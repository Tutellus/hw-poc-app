import { gql } from "graphql-request"

export const CHECK_CONTRACT_DATA_QUERY = gql`
  query CHECK_CONTRACT_DATA_QUERY($input: CheckContractDataInput!) {
    checkContractData(input: $input) {
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
