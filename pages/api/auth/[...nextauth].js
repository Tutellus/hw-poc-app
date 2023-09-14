import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { GQLService } from "@/services"

const signInPage = "/"

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "customJWT",
      name: "Custom Provider",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        console.warn(">>> authorize", credentials)
        const authenticate = await GQLService.authenticateUser({
          email: credentials.email,
        })

        if (!authenticate) return null

        const { token, tokenExpiry, refreshToken, user } = authenticate
        console.warn(">>> Authenticate ITEMS", {
          token,
          tokenExpiry,
          refreshToken,
          user,
        })
        return { token, tokenExpiry, refreshToken, user }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account, credentials }) {
      console.warn(">>> AUTH signIn", user, account, credentials)
      if (credentials.email) {
        const response = await GQLService.authenticateUser({
          email: credentials.email,
        })
        currentAuthResponse = response

        return true
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user.token,
          refreshToken: user.refreshToken,
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.refreshToken = token.refreshToken
      session.user.accessTokenExpires = token.accessTokenExpires

      return session
    },
  },
  pages: {
    signIn: signInPage,
    verifyRequest: `${signInPage}?error=EmailSent&type=success`,
    error: `${signInPage}?error=Default`,
  },
})
