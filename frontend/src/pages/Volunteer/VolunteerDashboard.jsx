import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
      <h2>Volunteer Dashboard</h2>
      <p>Welcome back, {user?.firstName}!</p>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center p-3 bg-light">
            <h6>Pending Requests</h6>
            <h3>{stats.pending}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3 bg-light">
            <h6>Active Requests</h6>
            <h3>{stats.active}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center p-3 bg-light">
            <h6>Completed</h6>
            <h3>{stats.completed}</h3>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="feature-card p-3">
            <h5>Support Requests</h5>
            <Button
              as={Link}
              to="/volunteer/requests"
              variant="outline-primary"
            >
              View Requests
            </Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="feature-card p-3">
            <h5>Available Requests</h5>
            <Button as={Link} to="/volunteer/available" variant="outline-primary">View Available</Button>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="feature-card p-3">
            <h5>My Profile</h5>
            <Button
              as={Link}
              to="/profile"
              variant="outline-primary"
            >
              Edit Profile
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VolunteerDashboard;