import { gql } from "graphql-request"

export const DEPLOY_HUMAN_MUTATION = gql`
  mutation DEPLOY_HUMAN_MUTATION($input: DeployHumanInput!) {
    deployHuman(input: $input) {
      __typename
      ... on Human {
        _id
        address
        chainId
        email
        projectId
        status
        stringSalt
        userId
      }
      ... on TypeError {
        message
      }
    }
  }
`
