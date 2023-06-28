import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import DiscordProvider from "next-auth/providers/discord"
import JWTHelper from "jsonwebtoken"
import NextAuth from "next-auth"

import { fetch } from "@/utils"

const config = {
  credentials: {
    accessKeyId: process.env.NEXTAUTH_AWS_ACCESS_KEY,
    secretAccessKey: process.env.NEXTAUTH_AWS_SECRET_KEY,
  },
  region: process.env.NEXTAUTH_AWS_REGION,
}

const client = DynamoDBDocument.from(new DynamoDB(config), {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

let currentAuthResponse = null
const MINUTES = 60 * 1000
const REFRESH_SESSION_GAP_IN_MINUTES =
  process.env.NEXTAUTH_REFRESH_SESSION_GAP_IN_MINUTES || 5

const signInPage = "/login"

const generateAuthToken = ({ id, ...user }) => {
  const authToken = JWTHelper.sign(
    { sub: id, ...user },
    process.env.NEXTAUTH_JWT_SECRET,
    {
      expiresIn: `${process.env.NEXTAUTH_JWT_SESSION_MAX_AGE_IN_SECONDS}s`,
    }
  )
  console.log({ authToken })
  return { authToken }
}

/**
 * NextAuth Auth API. Authenticate
 */
const authenticate = async (sessionUser) => {
  try {
    const defaultParams = {
      id: null,
      email: null,
      name: null,
      surname: null,
      emailVerified: null,
      image: null,
    }

    console.warn(">>> Authenticating user", sessionUser)
    const { authToken } = generateAuthToken({
      ...defaultParams,
      ...sessionUser,
    })
    console.warn(">>> Authenticate", authToken)
    const { authenticate } = await fetch(
      "AUTHENTICATE",
      { rfToken: null },
      { "x-api-next-auth": `Bearer ${authToken}` }
    )

    const { token, tokenExpiry, refreshToken, user } = authenticate
    return { token, tokenExpiry, refreshToken, user }
  } catch (error) {
    console.warn(">>> AUTHENTICATE ERROR", error)
  }
}

/**
 * NextAuth Auth API. Refresh token
 */
const refresh = async (token, rfToken) => {
  try {
    const { refreshToken: response } = await fetch(
      "REFRESH_TOKEN",
      { rfToken },
      { authorization: `Bearer ${token}` }
    )

    const {
      token: accessToken,
      tokenExpiry,
      refreshToken,
      user: userResponse,
    } = response
    return {
      token: accessToken,
      tokenExpiry,
      refreshToken,
      user: userResponse,
    }
  } catch (error) {
    console.warn(">>> Error refreshing session", error)
    deleteToken(rfToken)
  }
}

/**
 * NextAuth Auth API. Delete token
 */
const deleteToken = async (rfToken) => {
  await fetch("DELETE_TOKEN", { rfToken })
}

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.NEXTAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.NEXTAUTH_DISCORD_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: DynamoDBAdapter(client, {
    tableName: process.env.NEXTAUTH_TABLE_NAME,
  }),
  callbacks: {
    async signIn({ user, email }) {
      if (user) {
        // AUTHENTICATE. Se comporta como un signIn/signUp en función de si existe
        // previamente o no en BD
        const response = await authenticate({ ...user })
        currentAuthResponse = response

        return true
      }
      return true
    },

    // JWT se ejecuta después del signIn en cualquiera de los providers.
    // Se guarda la información de en el token para obtenerla en la sesión
    // actual.
    async jwt({ token, user }) {
      console.log("jwt---", JSON.stringify(token.api))
      if (user) {
        token.api = currentAuthResponse
      }

      return token
    },

    // Se ejecuta cada vez que se consulta la sesión: cada cambio de página,
    // periódicamente según lo configurado en _app.js y después de un.warnin.
    // Aquí se comprueba si la sesión guardada previamente está próxima a
    // caducar, si es así, se llama al método de refreshToken y se actualiza
    async session({ session, token }) {
      if (token?.api) {
        const {
          token: accessToken,
          refreshToken,
          tokenExpiry,
          user,
        } = token?.api

        const sessionExpiredInMin = Math.round(
          (new Date(tokenExpiry) - new Date()) / MINUTES
        )
        const isNextToExpire =
          sessionExpiredInMin < REFRESH_SESSION_GAP_IN_MINUTES

        console.warn(
          ">>> The session will expire in %s min. [Limit %s min] (%s - rfToken: %s)",
          sessionExpiredInMin,
          REFRESH_SESSION_GAP_IN_MINUTES,
          user.email,
          refreshToken
        )
        if (isNextToExpire) {
          console.warn(
            ">>> The session is about to expire. Refreshing session..."
          )
          const response = await refresh(accessToken, refreshToken)
          currentAuthResponse = response
          token.api = response

          session.accessToken = response?.token
          session.refreshToken = response?.refreshToken
          session.user = response?.user
        } else {
          session.accessToken = accessToken
          session.refreshToken = refreshToken
          session.user = user
        }
      } else {
        throw new Error("No token.api available")
      }

      return session
    },
  },
  pages: {
    signIn: signInPage,
    verifyRequest: `${signInPage}?error=EmailSent&type=success`,
    error: `${signInPage}?error=Default`,
  },
})
