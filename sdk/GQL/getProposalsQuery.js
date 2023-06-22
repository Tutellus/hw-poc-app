import { gql } from "graphql-request"

export const GET_PROPOSALS_QUERY = gql`
  query GET_PROPOSALS_QUERY($input: GetProposalsInput!) {
    getProposals(input: $input) {
      __typename
      ... on ProposalAssets {
        items {
          _id
          chainId
          humanId
          projectId
          title
          description
          sender
          required2FA
          status
          userOp {
            nonce
            callGasLimit
          }
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
