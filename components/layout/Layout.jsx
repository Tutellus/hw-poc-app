import Head from "next/head";
import { TopBar } from "../modules/TopBar";

export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <TopBar></TopBar>
      {children}
    </div>
  )
};