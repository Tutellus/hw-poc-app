import { gql } from "graphql-request"

export const REQUEST_PROPOSAL_MUTATION = gql`
  mutation REQUEST_PROPOSAL_MUTATION($input: RequestProposalInput!) {
    requestProposal(input: $input) {
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
