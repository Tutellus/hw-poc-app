import AuthQueries from "./queries"

export const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

const queries = {
  ...AuthQueries,
}

export const services = Object.fromEntries(
  Object.keys(queries).map((q) => [q, q])
)

const publicQueries = [services.AUTHENTICATE, services.REFRESH_TOKEN]

export const errors = {
  UNDEFINED: "UNDEFINED_ERROR",
  USER_NOT_AUTHENTICATED: "ERROR_USER_NOT_AUTHENTICATED",
}

export const getQuery = (name) => {
  if (!queries.hasOwnProperty(name)) throw `Undefined query: ${name}`
  return queries[name]
}

export const isPublicQuery = (name) => {
  return queries.hasOwnProperty(name) && publicQueries.indexOf(name) >= 0
}
