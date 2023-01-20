import Head from "next/head";
import styles from '@/styles/Home.module.css'

export const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>DID Demo</title>
      </Head>
      <main>{children}</main>
    </>
  )
};