import { GraphQLClient } from "graphql-request"

export const authFetcher = async (query, variables = null, accessToken) => {
  // const token = process.env.NEXT_PUBLIC_TOKEN_JWT

  const gqlClient = await new GraphQLClient(
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    {
      credentials: "same-origin",
    }
  )

  gqlClient.setHeaders({
    authorization: `Bearer ${accessToken}`,
  })

  try {
    const response = await gqlClient.request(query, variables)
    return response
  } catch (error) {
    console.error("< public fetcher - ERROR", error)
  }
}
