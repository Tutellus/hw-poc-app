import { Modal } from "../modules/modal/Modal";

export const Layout = ({ children }) => {
  return (
    <>
      <Modal/>
      <div className="layout">
        {children}
      </div>
    </>

  )
};