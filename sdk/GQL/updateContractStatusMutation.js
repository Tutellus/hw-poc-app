import { gql } from "graphql-request"

export const UPDATE_CONTRACT_STATUS_MUTATION = gql`
  mutation UPDATE_CONTRACT_STATUS_MUTATION ($input: UpdateContractStatusInput!) {
    updateContractStatus(input: $input) {
      __typename
      ... on ContractTx {
          to
          from
          transactionIndex
          transactionHash
          blockNumber
          gasUsed
          effectiveGasPrice
          status
      }
      ... on TypeError {
        message
      }
    }
  }
`
