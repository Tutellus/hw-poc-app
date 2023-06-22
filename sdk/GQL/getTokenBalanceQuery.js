import { gql } from "graphql-request"

export const GET_TOKENS_BALANCE_QUERY = gql`
  query GET_TOKENS_BALANCE_QUERY($input: GetTokensBalanceInput!) {
    getTokensBalance(input: $input) {
      __typename
      ... on TokensBalance {
        items {
          token
          decimals
          bigNumber
          value
        }
      }
      ... on TypeError {
        message
      }
    }
  }
`
