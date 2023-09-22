import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { Layout } from "@/components/layout/Layout"
import { Providers } from "@/components/layout/Providers"
import { SessionProvider, useSession, signIn } from "next-auth/react"
import "@/styles/globals.css"

const App = ({ Component, pageProps }) => {
  const router = useRouter()
  return (
    <Providers>
      <Head>
        <title>Human Wallet</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Layout router={router}>
        {Component.requireAuth ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </Layout>
    </Providers>
  )
}

function Auth({ children }) {
  const { data: session, status } = useSession()
  const user = session?.user
  const isUser = !!user

  const router = useRouter()

  useEffect(() => {
    // Do nothing while loading
    console.log(">>> signIn SESSION", session)
    if (status === "loading") return
    // If not authenticated, force log in
    if (!session) {
      return
    }
    signIn("customJWT", { email: user?.email })
  }, [session, status, router.route, user?.email])

  if (session) {
    return children
  }

  return null
}

const refetchInterval = parseInt(
  process.env.NEXT_PUBLIC_NEXTAUTH_SESSION_REFETCH_IN_SECONDS || "3600"
)

const AppWithAuth = (props) => (
  <SessionProvider
    session={props.pageProps.session}
    refetchInterval={refetchInterval}
  >
    <App {...props} />
  </SessionProvider>
)

export default AppWithAuth
