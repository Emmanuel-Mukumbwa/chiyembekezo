import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import { Card, Button, StatCard } from '../../components/ui';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Block navigation to /login with confirmation
  usePrompt(
    () => {
      logout();
      navigate('/login');
    },
    () => {}
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/peer-support/volunteer/requests');
      const requests = res.data;
      const pending = requests.filter(r => r.status === 'pending').length;
      const active = requests.filter(r => r.status === 'accepted').length;
      const completed = requests.filter(r => r.status === 'completed').length;
      setStats({ pending, active, completed });
    } catch (err) {
      showModal('Error', 'Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showModal(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        navigate('/login');
      }
    );
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Volunteer Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.firstName}!</p>
        </div>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
      <Row className="g-3 mb-4">
        <Col md={4}><StatCard icon="⏳" value={stats.pending} label="Pending Requests" variant="warning" /></Col>
        <Col md={4}><StatCard icon="🔄" value={stats.active} label="Active Requests" variant="info" /></Col>
        <Col md={4}><StatCard icon="✅" value={stats.completed} label="Completed" variant="success" /></Col>
      </Row>
      <Row>
        <Col md={4}><Card className="p-3 text-center"><h6>Support Requests</h6><Button as={Link} to="/volunteer/requests" variant="outline-primary">View Requests</Button></Card></Col>
        <Col md={4}><Card className="p-3 text-center"><h6>Available Requests</h6><Button as={Link} to="/volunteer/available" variant="outline-primary">View Available</Button></Card></Col>
        <Col md={4}><Card className="p-3 text-center"><h6>My Profile</h6><Button as={Link} to="/profile" variant="outline-primary">Edit Profile</Button></Card></Col>
      </Row>
    </Container>
  );
};

export default VolunteerDashboard;
