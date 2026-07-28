import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const LogoutButton = ({ variant = 'outline-danger', size = 'sm', className = '' }) => {
  const { logout } = useAuth();
  const { showModal, hideModal } = useModal();
  const navigate = useNavigate();

  const handleLogout = () => {
    showModal(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        navigate('/login');
        hideModal();
      }
    );
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
