import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ScrollToTop from '../ScrollToTop';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (!user) return <div>Please log in.</div>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop />
      <Navbar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <div
          className="d-none d-md-block bg-surface border-end"
          style={{
            width: '280px',
            minHeight: 'calc(100vh - 72px)',
            flexShrink: 0,
            position: 'sticky',
            top: '72px',
            alignSelf: 'flex-start',
          }}
        >
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="d-md-none"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1040,
            }}
            onClick={toggleSidebar}
          />
        )}

        {/* Mobile sidebar (slide-in) */}
        <div
          className="d-md-none bg-surface border-end"
          style={{
            width: '280px',
            minHeight: 'calc(100vh - 72px)',
            position: 'fixed',
            top: '72px',
            left: 0,
            bottom: 0,
            zIndex: 1050,
            overflowY: 'auto',
            transition: 'transform 0.3s ease',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <Sidebar onClose={closeSidebar} />
        </div>

        {/* Main content */}
        <div className="flex-grow-1 p-3 p-md-4 bg-warm" style={{ overflowX: 'hidden', minWidth: 0 }}>
          {/* Hamburger button – only on mobile */}
          <Button
            variant="outline-primary"
            size="sm"
            className="d-md-none mb-3"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? '✕' : '☰'} Menu
          </Button>
          <Container fluid className="px-0" style={{ overflowX: 'hidden' }}>
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
