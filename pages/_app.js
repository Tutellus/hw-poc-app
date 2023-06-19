import { Layout } from "@/components/layout/Layout";
import { Providers } from "@/components/layout/Providers";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";

const App = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <Providers>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </SessionProvider>
  );
};

export default App;
