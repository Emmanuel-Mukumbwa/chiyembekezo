import React, { createContext, useContext, useState } from 'react';
import CustomModal from '../components/CustomModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showModal = (title, message, onConfirm = null) => {
    setModal({ show: true, title, message, onConfirm });
  };

  const hideModal = () => {
    setModal({ ...modal, show: false });
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <CustomModal
        show={modal.show}
        onHide={hideModal}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText="OK"
        cancelText="Close"
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);