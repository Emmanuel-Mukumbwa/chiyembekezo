import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  // ---- Volunteer menu (only what volunteers need) ----
  if (role === 'volunteer') {
    const volunteerItems = [
      { icon: '📊', label: 'Dashboard', path: '/volunteer/dashboard' },
      { icon: '📋', label: 'My Requests', path: '/volunteer/requests' },
      { icon: '🆕', label: 'Available Requests', path: '/volunteer/available' },
      { icon: '👤', label: 'Profile', path: '/profile' },
      { icon: '⚙️', label: 'Settings', path: '/settings' },
    ];

    const handleLinkClick = () => {
      if (onClose) onClose();
    };

    return (
      <Nav className="flex-column p-3">
        <div className="mb-3">
          <h6 className="text-muted small text-uppercase fw-bold">Volunteer</h6>
        </div>
        {volunteerItems.map((item) => (
          <Nav.Link
            key={item.path}
            as={NavLink}
            to={item.path}
            className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-primary-600)' : 'var(--color-text)',
              backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
              fontWeight: isActive ? '600' : '400',
            })}
            onClick={handleLinkClick}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    );
  }

  // ---- Regular user menu (default) ----
  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '😊', label: 'Mood Tracker', path: '/mood-history' },
    { icon: '📝', label: 'Journal', path: '/journal' },
    { icon: '📋', label: 'Assessments', path: '/assessments' },
    { icon: '🧘', label: 'Wellness Toolkit', path: '/wellness' },
    { icon: '🎯', label: 'Goals', path: '/goals' },
    { icon: '✅', label: 'Habits', path: '/habits' },
    { icon: '📊', label: 'Reports', path: '/reports' },
    { icon: '🏆', label: 'Achievements', path: '/achievements' },
    { icon: '🛡️', label: 'Safety Plan', path: '/safety-plan' },
    { icon: '📅', label: 'Appointments', path: '/appointments' },
    { icon: '💬', label: 'Community', path: '/community' },
    { icon: '🤝', label: 'Peer Support', path: '/peer-support' },
  ];

  // Role‑specific extra items (admin, professional, org_admin, listener)
  const roleItems = {
    admin: [{ icon: '⚙️', label: 'Admin Panel', path: '/admin' }],
    professional: [{ icon: '👨‍⚕️', label: 'Professional Portal', path: '/professional' }],
    org_admin: [{ icon: '🏢', label: 'Organization', path: '/organization' }],
    listener: [{ icon: '👂', label: 'Listener Dashboard', path: '/listener/dashboard' }],
  };

  const extraItems = role && roleItems[role] ? roleItems[role] : [];
  // For volunteers, we already returned early above – they never reach this point.
  // So we can safely exclude 'volunteer' from here.

  const allItems = [...menuItems, ...extraItems];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <Nav className="flex-column p-3">
      <div className="mb-3">
        <h6 className="text-muted small text-uppercase fw-bold">Main</h6>
      </div>
      {allItems.map((item) => (
        <Nav.Link
          key={item.path}
          as={NavLink}
          to={item.path}
          className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
          style={({ isActive }) => ({
            color: isActive ? 'var(--color-primary-600)' : 'var(--color-text)',
            backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
            fontWeight: isActive ? '600' : '400',
          })}
          onClick={handleLinkClick}
        >
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          {item.label}
        </Nav.Link>
      ))}
      <hr />
      <Nav.Link
        as={NavLink}
        to="/profile"
        className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
        onClick={handleLinkClick}
      >
        <span style={{ fontSize: '1.2rem' }}>👤</span> Profile
      </Nav.Link>
      <Nav.Link
        as={NavLink}
        to="/settings"
        className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
        onClick={handleLinkClick}
      >
        <span style={{ fontSize: '1.2rem' }}>⚙️</span> Settings
      </Nav.Link>
    </Nav>
  );
};

export default Sidebar;
