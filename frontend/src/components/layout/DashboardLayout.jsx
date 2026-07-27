import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!user) return <div>Please log in.</div>;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        {/* Sidebar - hidden on mobile unless toggled */}
        <div className={`bg-surface border-end ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`} style={{ width: '280px', minHeight: 'calc(100vh - 72px)' }}>
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="flex-grow-1 p-4 bg-warm">
          {/* Mobile toggle */}
          <Button
            variant="outline-primary"
            size="sm"
            className="d-md-none mb-3"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? '← Hide Menu' : '☰ Show Menu'}
          </Button>
          <Container fluid>
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
