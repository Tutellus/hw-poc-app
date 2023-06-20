import { useEffect } from "react"
import { useRouter } from "next/router"
import { Layout } from "@/components/layout/Layout";
import { Providers } from "@/components/layout/Providers";
import { SessionProvider, useSession, signIn } from "next-auth/react"
import "@/styles/globals.css";

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Layout>
        {Component.requireAuth ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </Layout>
    </Providers>
  );
};


function Auth({ children }) {
  const { data: session, status } = useSession()
  const user = session?.user
  const isUser = !!user

  const router = useRouter()

  useEffect(() => {
    // Do nothing while loading
    if (status === "loading") return
    // If not authenticated, force log in
    if (!isUser) return signIn()
  }, [isUser, status, router.route])

  if (isUser) {
    return children
  }

  return null
}

const refetchInterval = parseInt(process.env.NEXT_PUBLIC_NEXTAUTH_SESSION_REFETCH_IN_SECONDS || "3600")

const AppWithAuth = (props) => (
  <SessionProvider session={props.pageProps.session} refetchInterval={refetchInterval}>
    <App {...props} />
  </SessionProvider>
)

export default AppWithAuth;
