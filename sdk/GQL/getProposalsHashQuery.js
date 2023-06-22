import { gql } from "graphql-request"

export const GET_PROPOSALS_HASH_QUERY = gql`
  query GET_PROPOSALS_HASH_QUERY($proposalId: String!) {
    getProposalHash(proposalId: $proposalId) {
      __typename
      ... on ProposalHash {
        hash
      }
      ... on TypeError {
        message
      }
    }
  }
`
