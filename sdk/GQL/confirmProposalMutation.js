import { gql } from "graphql-request"

export const CONFIRM_PROPOSAL_MUTATION = gql`
  mutation CONFIRM_PROPOSAL_MUTATION ($input: ConfirmProposalInput!) {
    confirmProposal(input: $input) {
      __typename
      ... on Proposal {
          _id
          chainId
          humanId
          projectId
          title
          description
          sender
          calls {
              target
              method
              data
              value
              decodedData
              masterSignature
              required2FA
          }
          required2FA
          status
          txHash
          userOp {
              nonce
              callGasLimit
          }
      }
      ... on TypeError {
        message
      }
    }
  }
`
