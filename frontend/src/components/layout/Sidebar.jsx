import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

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

  // Role-specific items
  const roleItems = {
    admin: [{ icon: '⚙️', label: 'Admin Panel', path: '/admin' }],
    professional: [{ icon: '👨‍⚕️', label: 'Professional Portal', path: '/professional' }],
    org_admin: [{ icon: '🏢', label: 'Organization', path: '/organization' }],
    volunteer: [{ icon: '🤝', label: 'Volunteer Dashboard', path: '/volunteer/dashboard' }],
    listener: [{ icon: '👂', label: 'Listener Dashboard', path: '/listener/dashboard' }],
  };

  const extraItems = user?.role ? roleItems[user.role] || [] : [];

  const allItems = [...menuItems, ...extraItems];

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
      >
        <span style={{ fontSize: '1.2rem' }}>👤</span> Profile
      </Nav.Link>
      <Nav.Link
        as={NavLink}
        to="/settings"
        className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
      >
        <span style={{ fontSize: '1.2rem' }}>⚙️</span> Settings
      </Nav.Link>
    </Nav>
  );
};

export default Sidebar;
