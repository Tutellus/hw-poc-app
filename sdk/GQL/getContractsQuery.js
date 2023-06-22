import { gql } from "graphql-request"

export const GET_CONTRACTS_QUERY = gql`
  query GET_CONTRACTS_QUERY($input: GetContractsInput) {
    getContracts(input: $input) {
      __typename
      ... on ContractAssets {
        items {
          _id
          name
          address
          abi
          chainId
          isProxy
          implementationAddress
        }
        metadata {
          numElements
          offset
          limit
          page
          pages
          orderBy
          orderDirection
        }
      }
      ... on TypeError {
        message
      }
    }
  }
`
