import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';

const ProfessionalLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (!user?.isProfessional) {
    return (
      <Container className="my-5 text-center">
        <h3>Access Denied</h3>
        <p>You need to be a verified professional to view this page.</p>
        <Button as={Link} to="/dashboard" variant="primary">Back to Dashboard</Button>
      </Container>
    );
  }

  const isActive = (path) => {
    if (path === '' && location.pathname === '/professional') return true;
    return location.pathname === `/professional${path}` || location.pathname.startsWith(`/professional${path}`);
  };

  const menuItems = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/patients', label: 'Patients', icon: '👥' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/availability', label: 'Availability', icon: '🕒' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Desktop sidebar */}
        <Col md={3} lg={2} className="d-none d-md-block bg-light p-3" style={{ minHeight: '80vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">👨‍⚕️ Professional</h5>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
          <Nav className="flex-column">
            {menuItems.map(item => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={`/professional${item.path}`}
                className={isActive(item.path) ? 'active fw-bold' : ''}
                style={{
                  color: isActive(item.path) ? '#0d6efd' : 'inherit',
                  backgroundColor: isActive(item.path) ? '#e7f1ff' : 'transparent',
                  borderRadius: '0.25rem',
                }}
                onClick={closeSidebar}
              >
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <hr />
          <Nav.Link as={Link} to="/dashboard" className="text-muted" onClick={closeSidebar}>
            ← Back to Dashboard
          </Nav.Link>
        </Col>

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
          className="d-md-none bg-light p-3"
          style={{
            width: '280px',
            minHeight: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1050,
            overflowY: 'auto',
            transition: 'transform 0.3s ease',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">👨‍⚕️ Professional</h5>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
          <Nav className="flex-column">
            {menuItems.map(item => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={`/professional${item.path}`}
                className={isActive(item.path) ? 'active fw-bold' : ''}
                style={{
                  color: isActive(item.path) ? '#0d6efd' : 'inherit',
                  backgroundColor: isActive(item.path) ? '#e7f1ff' : 'transparent',
                  borderRadius: '0.25rem',
                }}
                onClick={closeSidebar}
              >
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <hr />
          <Nav.Link as={Link} to="/dashboard" className="text-muted" onClick={closeSidebar}>
            ← Back to Dashboard
          </Nav.Link>
        </div>

        {/* Main content */}
        <Col md={9} lg={10} className="p-3 p-md-4">
          <Button
            variant="outline-primary"
            size="sm"
            className="d-md-none mb-3"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? '✕' : '☰'} Menu
          </Button>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalLayout;
