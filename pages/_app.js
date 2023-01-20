import { Layout } from '@/components/layout/Layout'
import { MainContextProvider } from '@/state/main.context'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return <MainContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MainContextProvider>
}
