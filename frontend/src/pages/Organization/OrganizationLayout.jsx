//src/pages/Organization/OrganizationLayout.jsx
import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OrganizationLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Check if user has org admin role (we can add this to context later)
  // For now, we assume if they access this route, they are authorized.

  const isActive = (path) => location.pathname === `/organization${path}` || location.pathname.startsWith(`/organization${path}`);

  const menuItems = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: '/members', label: 'Members', icon: '👥' },
    { path: '/insights', label: 'Insights', icon: '📈' },
  ];

  return (
    <Container fluid className="my-4">
      <Row>
        <Col md={3} lg={2} className="bg-light p-3" style={{ minHeight: '80vh' }}>
          <h5 className="mb-3">Organization Portal</h5>
          <Nav className="flex-column">
            {menuItems.map(item => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={`/organization${item.path}`}
                className={isActive(item.path) ? 'active fw-bold' : ''}
                style={{ color: isActive(item.path) ? '#0d6efd' : 'inherit' }}
              >
                {item.icon} {item.label}
              </Nav.Link>
            ))}
          </Nav>
          <hr />
          <Nav.Link as={Link} to="/dashboard" className="text-muted">← Back to Dashboard</Nav.Link>
        </Col>
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default OrganizationLayout;