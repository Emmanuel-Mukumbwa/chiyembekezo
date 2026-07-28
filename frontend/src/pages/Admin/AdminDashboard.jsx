import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import { Card, StatCard, ErrorState } from '../../components/ui';

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
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}><StatCard icon="👥" value={stats.users.total} label="Total Users" variant="primary" /></Col>
        <Col md={3} sm={6}><StatCard icon="🟢" value={stats.users.active} label="Active Users" variant="success" /></Col>
        <Col md={3} sm={6}><StatCard icon="📄" value={stats.posts} label="Forum Posts" variant="info" /></Col>
        <Col md={3} sm={6}><StatCard icon="📅" value={stats.appointments} label="Appointments" variant="warning" /></Col>
        <Col md={3} sm={6}><StatCard icon="📊" value={stats.assessments} label="Assessments" variant="danger" /></Col>
        <Col md={3} sm={6}><StatCard icon="😊" value={stats.mood_entries} label="Mood Entries" variant="secondary" /></Col>
        <Col md={3} sm={6}><StatCard icon="📝" value={stats.journal_entries} label="Journal Entries" variant="dark" /></Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Weekly New Users</h6>
            {stats.weekly_users.map((d) => (
              <div key={d.date} className="d-flex justify-content-between border-bottom py-1">
                <span>{d.date}</span>
                <span>{d.count}</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Mood Trend (last 6 months)</h6>
            {stats.mood_trend.map((d) => (
              <div key={d.month} className="d-flex justify-content-between border-bottom py-1">
                <span>{d.month}</span>
                <span>{parseFloat(d.avg_mood).toFixed(2)}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
