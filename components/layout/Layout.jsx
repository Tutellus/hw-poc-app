import Head from "next/head";
import { Modal } from "../modules/modal/Modal";
import { TopBar } from "../modules/TopBar";

export const Layout = ({ children }) => {
  return (
    <>
      <Modal/>
      <div className="layout">
        {/* <TopBar></TopBar> */}
        {children}
      </div>
    </>

  )
};