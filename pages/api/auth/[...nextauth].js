import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { GQLService } from "@/services"

const signInPage = "/dashboard"

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
        const authenticate = await GQLService.authenticateUser({
          email: credentials.email,
        })

        if (!authenticate) return null

        const { token, tokenExpiry, refreshToken, user } = authenticate
        return { token, tokenExpiry, refreshToken, user }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn(data) {
      const response = await GQLService.authenticateUser({
        email: data?.credentials.email,
      })

      return {
        accessToken: response.token,
        refreshToken: response.refreshToken,
        user: data?.user,
        account: data?.account,
      }
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
