export const authFetcher = async ({ query, variables = {} }) => {
  const headers = {
    "Content-Type": "application/json",
  }

  const body = {
    query,
    variables,
  }

  const response = await fetch(process.env.NEXTAUTH_HOST_MINIMAL_AUTH, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors && Array.isArray(result.errors)) {
    const errorMessages = result.errors.map((err) => err.message).join("\n")
    throw new Error(`GraphQL Errors:\n${errorMessages}`)
  }

  const { __typename: typename, message } = Object.values(result.data)[0]

  if (typename.endsWith("Error")) {
    throw new Error(`${typename} - ${message}`)
  }

  return result.data
}
