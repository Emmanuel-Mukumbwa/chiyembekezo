import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';

const AppLayout = ({ children, maxWidth = 'xl', className = '' }) => {
  const { user } = useAuth();

  const containerClasses = {
    sm: 'container-sm',
    md: 'container-md',
    lg: 'container-lg',
    xl: 'container-xl',
    fluid: 'container-fluid',
  };
  const containerClass = containerClasses[maxWidth] || 'container-xl';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className={`flex-grow-1 py-4 ${className}`}>
        <Container className={containerClass}>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
