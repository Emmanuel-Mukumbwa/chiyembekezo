import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  // All groups closed by default
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  // ----- Regular user groups -----
  const userGroups = [
    {
      id: 'main',
      label: 'Main',
      icon: '📊',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { icon: '😊', label: 'Mood Tracker', path: '/mood-history' },
        { icon: '📝', label: 'Journal', path: '/journal' },
        { icon: '📋', label: 'Assessments', path: '/assessments' },
      ]
    },
    {
      id: 'wellness',
      label: 'Wellness',
      icon: '🧘',
      items: [
        { icon: '🧘', label: 'Wellness Toolkit', path: '/wellness' },
        { icon: '🫁', label: 'Breathing', path: '/wellness/breathing' },
        { icon: '🧘', label: 'Meditation', path: '/wellness/meditation' },
        { icon: '🌿', label: 'Grounding', path: '/wellness/grounding' },
        { icon: '🌧', label: 'Sounds', path: '/wellness/sounds' },
        { icon: '⏰', label: 'Timers', path: '/wellness/timers' },
        { icon: '✅', label: 'Daily Wellness', path: '/wellness/daily' },
      ]
    },
    {
      id: 'goals',
      label: 'Goals & Habits',
      icon: '🎯',
      items: [
        { icon: '🎯', label: 'Goals', path: '/goals' },
        { icon: '✅', label: 'Habits', path: '/habits' },
        { icon: '🏆', label: 'Achievements', path: '/achievements' },
      ]
    },
    {
      id: 'support',
      label: 'Support',
      icon: '🛡️',
      items: [
        { icon: '🛡️', label: 'Safety Plan', path: '/safety-plan' },
        { icon: '📅', label: 'Appointments', path: '/appointments' },
        { icon: '💬', label: 'Community', path: '/community' },
        { icon: '🤝', label: 'Peer Support', path: '/peer-support' },
      ]
    },
    {
      id: 'account',
      label: 'Account',
      icon: '👤',
      items: [
        { icon: '👤', label: 'Profile', path: '/profile' },
        { icon: '⚙️', label: 'Settings', path: '/settings' },
      ]
    },
  ];

  // ----- Role-specific groups -----
  const roleGroups = {
    admin: {
      id: 'admin',
      label: 'Admin',
      icon: '⚙️',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/admin' },
        { icon: '👥', label: 'Users', path: '/admin/users' },
        { icon: '👨‍⚕️', label: 'Professionals', path: '/admin/professionals' },
        { icon: '🤝', label: 'Volunteers', path: '/admin/volunteers' },
        { icon: '🏢', label: 'Organizations', path: '/admin/organizations' },
        { icon: '📝', label: 'Applications', path: '/admin/applications' },
        { icon: '✉️', label: 'Invitations', path: '/admin/invitations' },
        { icon: '📄', label: 'Articles', path: '/admin/articles' },
        { icon: '📁', label: 'Resources', path: '/admin/resources' },
        { icon: '📅', label: 'Appointments', path: '/admin/appointments' },
        { icon: '💬', label: 'Community', path: '/admin/community' },
        { icon: '🤝', label: 'Peer Support', path: '/admin/peer-support' },
        { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
      ]
    },
    professional: {
      id: 'professional',
      label: 'Practice',
      icon: '👨‍⚕️',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/professional' },
        { icon: '📅', label: 'Appointments', path: '/professional/appointments' },
        { icon: '👥', label: 'Patients', path: '/professional/patients' },
        { icon: '💬', label: 'Messages', path: '/professional/messages' },
        { icon: '🕒', label: 'Availability', path: '/professional/availability' },
        { icon: '📈', label: 'Reports', path: '/professional/reports' },
      ]
    },
    volunteer: {
      id: 'volunteer',
      label: 'Volunteer',
      icon: '🤝',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/volunteer/dashboard' },
        { icon: '📋', label: 'My Requests', path: '/volunteer/requests' },
        { icon: '🆕', label: 'Available Requests', path: '/volunteer/available' },
      ]
    },
    listener: {
      id: 'listener',
      label: 'Listener',
      icon: '👂',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/listener/dashboard' },
      ]
    },
  };

  // Build groups based on role
  let groups = [...userGroups];
  if (role === 'admin') {
    groups.push(roleGroups.admin);
  } else if (role === 'professional') {
    groups.push(roleGroups.professional);
  } else if (role === 'volunteer') {
    groups.push(roleGroups.volunteer);
  } else if (role === 'listener') {
    groups.push(roleGroups.listener);
  }

  return (
    <Nav className="flex-column p-3">
      {groups.map((group) => (
        <div key={group.id} className="mb-2">
          <div
            className="d-flex align-items-center justify-content-between py-2 px-3 rounded-md"
            style={{
              cursor: 'pointer',
              backgroundColor: openGroups[group.id] ? 'var(--color-primary-50)' : 'transparent',
              borderRadius: '8px',
              fontWeight: '600',
              color: 'var(--color-text)',
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
              {group.items.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={NavLink}
                  to={item.path}
                  className="d-flex align-items-center gap-2 py-2 px-3 rounded-md"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--color-primary-600)' : 'var(--color-text)',
                    backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                    fontWeight: isActive ? '600' : '400',
                    marginLeft: '8px',
                  })}
                  onClick={handleLinkClick}
                >
                  <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Nav.Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </Nav>
  );
};

export default Sidebar;
