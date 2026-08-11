import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
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
      <div className="d-flex" style={{ flex: '1 1 0%', overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <div
          className="d-none d-md-block bg-surface border-end"
          style={{
            width: '280px',
            flexShrink: 0,
            minHeight: '100%',
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

        {/* Main content – forced to stay inside */}
        <div
          className="flex-grow-1 p-3 p-md-4 bg-warm"
          style={{
            minWidth: 0,
            maxWidth: '100%',
            flex: '1 1 0%',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <Button
            variant="outline-primary"
            size="sm"
            className="d-md-none mb-3"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? '✕' : '☰'} Menu
          </Button>
          <div style={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
