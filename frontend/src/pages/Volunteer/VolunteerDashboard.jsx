import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import {
  Button,
  Card,
  StatCard,
  ErrorState,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  const { showModal } = useModal();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  usePrompt(
    () => {
      logout();
      window.location.href = '/login';
    },
    () => {}
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/peer-support/volunteer/requests');
      const requests = res.data;
      const pending = requests.filter(r => r.status === 'pending').length;
      const active = requests.filter(r => r.status === 'accepted').length;
      const completed = requests.filter(r => r.status === 'completed').length;
      setStats({ pending, active, completed });
    } catch (err) {
      setError('Failed to load statistics.');
      showModal('Error', 'Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading data" description={error} onRetry={fetchStats} />;

  // Use user?.firstName or fallback to email
  const displayName = user?.firstName || user?.email || 'Volunteer';

  return (
    <Container fluid className="px-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold">Volunteer Dashboard</h2>
          <p className="text-muted">Welcome back, {displayName}!</p>
        </div>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}><StatCard icon="⏳" value={stats.pending} label="Pending Requests" variant="warning" /></Col>
        <Col md={4}><StatCard icon="🔄" value={stats.active} label="Active Requests" variant="info" /></Col>
        <Col md={4}><StatCard icon="✅" value={stats.completed} label="Completed" variant="success" /></Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <Card className="p-3 text-center h-100">
            <h6>Support Requests</h6>
            <Button as={Link} to="/volunteer/requests" variant="outline-primary" size="sm">
              View Requests
            </Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 text-center h-100">
            <h6>Available Requests</h6>
            <Button as={Link} to="/volunteer/available" variant="outline-primary" size="sm">
              View Available
            </Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 text-center h-100">
            <h6>My Profile</h6>
            <Button as={Link} to="/profile" variant="outline-primary" size="sm">
              Edit Profile
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VolunteerDashboard;
