import { getSession, signOut } from "next-auth/react"
import { GraphQLClient, gql } from "graphql-request"

import { endpoint, errors, getQuery, isPublicQuery } from "@/utils"

const client = new GraphQLClient(endpoint || "")

export const fetch = async (queryName, variables, headers) => {
  const session = await getSession()
  const token = `${session?.accessToken}`
  const queryStr = getQuery(queryName)

  const isPublic = isPublicQuery(queryName)
  if (!isPublic) {
    setAuthToken(token)
  }

  if (!!headers) {
    client.setHeaders(headers)
  }

  try {
    const data = await client.request(
      gql`
        ${queryStr}
      `,
      variables
    )

    const { __typename, ...error } = data[Object.keys(data)[0]]
    if (["GenericError"].indexOf(__typename) >= 0) {
      console.error("ERROR: ", data)
      throw error
    }
    return data
  } catch (error) {
    // Controlled error
    if (error.hasOwnProperty("code")) {
      if (error.code === errors.USER_NOT_AUTHENTICATED) {
        signOutAndDeleteToken()
        return
      } else {
        throw error
      }
    }
    // Uncontrolled error
    const { response = {} } = JSON.parse(JSON.stringify(error, undefined, 2))
    const undefinedError = {
      code: errors.UNDEFINED,
      message: response.errors ? response.errors[0].message : "Undefined error",
      description: null,
    }
    throw undefinedError
  }
}

export const signOutAndDeleteToken = async () => {
  try {
    const session = await getSession()
    const rfToken = session?.refreshToken
    await fetch("DELETE_TOKEN", { rfToken })
  } catch (error) {
    console.error("ERROR DELETING SESSION", error)
  }
  signOut()
}

export const setAuthToken = (token) => {
  client.setHeaders({
    authorization: `Bearer ${token}`,
  })
}
