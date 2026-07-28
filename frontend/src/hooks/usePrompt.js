import { useBlocker } from 'react-router-dom';
import { useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

export const usePrompt = (onConfirm, onCancel) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return nextLocation.pathname === '/login';
  });
  const { showModal, hideModal } = useModal();
  const { logout } = useAuth();

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showModal(
        'Confirm Logout',
        'Are you sure you want to leave? You will be logged out.',
        () => {
          logout();
          blocker.proceed();
          hideModal();
          if (onConfirm) onConfirm();
        },
        () => {
          blocker.reset();
          hideModal();
          if (onCancel) onCancel();
        }
      );
    }
  }, [blocker, showModal, hideModal, logout, onConfirm, onCancel]);
};
