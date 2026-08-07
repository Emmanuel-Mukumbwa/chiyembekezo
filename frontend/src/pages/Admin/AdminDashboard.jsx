import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import { Card, Button, StatCard, ErrorState } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
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
      const res = await api.get('/admin/analytics');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load analytics.');
      showModal('Error', 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading data" description={error} onRetry={fetchStats} />;
  if (!stats) return <p className="text-center mt-5">No data available.</p>;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <div className="d-flex gap-2">
          <Button as={Link} to="/admin/analytics" variant="outline-primary" size="sm">
            📊 Full Analytics
          </Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      {/* Summary Cards (same as analytics but simpler) */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}><StatCard icon="👥" value={stats.users.total} label="Total Users" variant="primary" /></Col>
        <Col md={3} sm={6}><StatCard icon="🟢" value={stats.users.active} label="Active Users" variant="success" /></Col>
        <Col md={3} sm={6}><StatCard icon="📄" value={stats.posts} label="Forum Posts" variant="info" /></Col>
        <Col md={3} sm={6}><StatCard icon="📅" value={stats.appointments} label="Appointments" variant="warning" /></Col>
        <Col md={3} sm={6}><StatCard icon="📊" value={stats.assessments} label="Assessments" variant="danger" /></Col>
        <Col md={3} sm={6}><StatCard icon="😊" value={stats.mood_entries} label="Mood Entries" variant="secondary" /></Col>
        <Col md={3} sm={6}><StatCard icon="📝" value={stats.journal_entries} label="Journal Entries" variant="dark" /></Col>
        <Col md={3} sm={6}><StatCard icon="👨‍⚕️" value={`${stats.professionals.verified}/${stats.professionals.total}`} label="Verified Professionals" variant="info" /></Col>
      </Row>

      {/* Quick links to key admin areas */}
      <Row>
        <Col md={4}>
          <Card className="p-3 text-center">
            <h6>👥 Users</h6>
            <Button as={Link} to="/admin/users" variant="outline-primary" size="sm">Manage Users</Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 text-center">
            <h6>📄 Content</h6>
            <Button as={Link} to="/admin/resources" variant="outline-primary" size="sm">Manage Resources</Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 text-center">
            <h6>📊 Analytics</h6>
            <Button as={Link} to="/admin/analytics" variant="outline-primary" size="sm">View Full Analytics</Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
