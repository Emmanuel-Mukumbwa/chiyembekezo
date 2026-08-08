import React, { useState } from 'react';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // All groups closed by default
  const [openGroups, setOpenGroups] = useState({});

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleGroup = (group) => setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  if (!user?.isAdmin) {
    return <div className="text-center mt-5">Access Denied. Admin only.</div>;
  }

  const isActive = (path) => location.pathname === `/admin${path}` || location.pathname.startsWith(`/admin${path}`);

  const groups = [
    {
      id: 'main',
      label: 'Main',
      icon: '📊',
      items: [
        { path: '', label: 'Dashboard', icon: '📊' },
      ]
    },
    {
      id: 'users',
      label: 'Users & Roles',
      icon: '👥',
      items: [
        { path: '/users', label: 'Users', icon: '👥' },
        { path: '/professionals', label: 'Professionals', icon: '👨‍⚕️' },
        { path: '/volunteers', label: 'Volunteers', icon: '🤝' },
        { path: '/organizations', label: 'Organizations', icon: '🏢' },
        { path: '/applications', label: 'Applications', icon: '📝' },
        { path: '/invitations', label: 'Invitations', icon: '✉️' },
      ]
    },
    {
      id: 'content',
      label: 'Content',
      icon: '📄',
      items: [
        { path: '/articles', label: 'Articles', icon: '📄' },
        { path: '/resources', label: 'Resources', icon: '📁' },
      ]
    },
    {
      id: 'community',
      label: 'Community',
      icon: '💬',
      items: [
        { path: '/community', label: 'Community', icon: '💬' },
        { path: '/peer-support', label: 'Peer Support', icon: '🤝' },
      ]
    },
    {
      id: 'wellness',
      label: 'Wellness',
      icon: '🧘',
      items: [
        { path: '/wellness/meditations', label: 'Meditations', icon: '🧘' },
        { path: '/wellness/sounds', label: 'Sounds', icon: '🌧' },
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: '⚙️',
      items: [
        { path: '/appointments', label: 'Appointments', icon: '📅' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
      ]
    },
  ];

  const renderNavItems = (items) => (
    items.map(item => (
      <Nav.Link
        key={item.path}
        as={Link}
        to={`/admin${item.path}`}
        className={isActive(item.path) ? 'active fw-bold' : ''}
        style={{
          color: isActive(item.path) ? '#0d6efd' : 'inherit',
          backgroundColor: isActive(item.path) ? '#e7f1ff' : 'transparent',
          borderRadius: '0.25rem',
          padding: '0.5rem 1rem',
          marginLeft: '8px',
        }}
        onClick={closeSidebar}
      >
        <span style={{ marginRight: '8px' }}>{item.icon}</span>
        {item.label}
      </Nav.Link>
    ))
  );

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Desktop sidebar */}
        <Col md={3} lg={2} className="d-none d-md-block bg-light p-3" style={{ minHeight: '80vh' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Admin Panel</h5>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
          <Nav className="flex-column">
            {groups.map((group) => (
              <div key={group.id} className="mb-2">
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-3 rounded-md"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: openGroups[group.id] ? '#e9ecef' : 'transparent',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>
                    <span style={{ marginRight: '8px' }}>{group.icon}</span>
                    {group.label}
                  </span>
                  {openGroups[group.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </div>
                {openGroups[group.id] && (
                  <div className="mt-1">
                    {renderNavItems(group.items)}
                  </div>
                )}
              </div>
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
            <h5 className="mb-0">Admin Panel</h5>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
          <Nav className="flex-column">
            {groups.map((group) => (
              <div key={group.id} className="mb-2">
                <div
                  className="d-flex align-items-center justify-content-between py-2 px-3 rounded-md"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: openGroups[group.id] ? '#e9ecef' : 'transparent',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>
                    <span style={{ marginRight: '8px' }}>{group.icon}</span>
                    {group.label}
                  </span>
                  {openGroups[group.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                </div>
                {openGroups[group.id] && (
                  <div className="mt-1">
                    {renderNavItems(group.items)}
                  </div>
                )}
              </div>
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

export default AdminLayout;
