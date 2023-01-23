import Head from "next/head";
import { TopBar } from "../modules/TopBar";

export const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Shared Mgmt Wallet Concept</title>
      </Head>
      <body>
        <TopBar></TopBar>
        {children}
      </body>
    </>
  )
};