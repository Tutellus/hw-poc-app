/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useMemo } from "react";

const Modal = createContext({
  visible: false,
  body: null,
  openModal: () => {},
  closeModal: () => {},
});

function ModalProvider(props) {

  const [visible, setVisible] = useState(false);
  const [body, setBody] = useState(null);

  const openModal = (body) => {
    setVisible(true);
    setBody(body);
  };

  const closeModal = () => {
    setVisible(false);
    setBody(null);
  };
  
  const memoizedData = useMemo(
    () => ({
      visible,
      body,
      openModal,
      closeModal,
    }),
    [visible, body]
  );

  return <Modal.Provider value={memoizedData} {...props} />;
}

function useModal() {
  const context = useContext(Modal);
  if (context === undefined) {
    throw new Error(
      `useModalContext must be used within a ModalProvider`
    );
  }
  return context;
}

export { ModalProvider, useModal };