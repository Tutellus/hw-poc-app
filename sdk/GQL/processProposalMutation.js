import { gql } from "graphql-request"

export const PROCESS_PROPOSAL_MUTATION = gql`
  mutation PROCESS_PROPOSAL_MUTATION($input: ProcessProposalInput!) {
    processProposal(input: $input) {
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
