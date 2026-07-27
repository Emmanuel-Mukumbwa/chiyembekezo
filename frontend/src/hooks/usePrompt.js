import { useBlocker } from 'react-router-dom';
import { useEffect } from 'react';
import { useModal } from '../context/ModalContext';

export const usePrompt = (onConfirm, onCancel) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return nextLocation.pathname === '/login';
  });
  const { showModal } = useModal();

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showModal(
        'Confirm Logout',
        'Are you sure you want to leave? You will be logged out.',
        () => {
          blocker.proceed();
          if (onConfirm) onConfirm();
        },
        () => {
          blocker.reset();
          if (onCancel) onCancel();
        }
      );
    }
  }, [blocker, showModal, onConfirm, onCancel]);
};
