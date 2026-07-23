import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.isAdmin) {
    return <div className="text-center mt-5">Access Denied. Admin only.</div>;
  }

  const isActive = (path) => location.pathname === `/admin${path}` || location.pathname.startsWith(`/admin${path}`);

  const menuItems = [
    { path: '', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/professionals', label: 'Professionals', icon: '👨‍⚕️' },
    { path: '/volunteers', label: 'Volunteers', icon: '🤝' },
    { path: '/organizations', label: 'Organizations', icon: '🏢' },
    { path: '/articles', label: 'Articles', icon: '📄' },
    { path: '/resources', label: 'Resources', icon: '📁' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/community', label: 'Community', icon: '💬' },
    { path: '/peer-support', label: 'Peer Support', icon: '🤝' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <Container fluid className="my-4">
      <Row>
        <Col md={3} lg={2} className="bg-light p-3" style={{ minHeight: '80vh' }}>
          <h5 className="mb-3">Admin Panel</h5>
          <Nav className="flex-column">
            {menuItems.map(item => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={`/admin${item.path}`}
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

export default AdminLayout;