import { GraphQLClient } from "graphql-request"

export const authFetcher = async ({ uri, query, variables = {}, accessToken, projectId }) => {
  const gqlClient = await new GraphQLClient(
    uri,
    {
      credentials: "same-origin",
    }
  )

  gqlClient.setHeaders({
    authorization: `Bearer ${accessToken}`,
    'x-project-key': projectId,
  })

  return gqlClient.request(query, variables)
}
