import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfessionalLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.isProfessional) {
    return (
      <Container className="my-5 text-center">
        <h3>Access Denied</h3>
        <p>You need to be a verified professional to view this page.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
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
        <Col md={3} lg={2} className="bg-light p-3" style={{ minHeight: '80vh' }}>
          <h5 className="mb-3">👨‍⚕️ Professional Portal</h5>
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
              >
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <hr />
          <Nav.Link as={Link} to="/dashboard" className="text-muted">
            ← Back to Dashboard
          </Nav.Link>
        </Col>
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalLayout;