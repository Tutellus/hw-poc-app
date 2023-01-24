import { Layout } from '@/components/layout/Layout';
import { Providers } from '@/components/layout/Providers';
import '@/styles/globals.css'

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
}

export default App
