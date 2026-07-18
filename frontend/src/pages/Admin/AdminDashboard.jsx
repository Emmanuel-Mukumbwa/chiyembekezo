import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminDashboard = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setStats(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!stats) return <p>No data.</p>;

  const cards = [
    { label: 'Total Users', value: stats.users.total, color: 'primary' },
    { label: 'Active Users', value: stats.users.active, color: 'success' },
    { label: 'Forum Posts', value: stats.posts, color: 'info' },
    { label: 'Appointments', value: stats.appointments, color: 'warning' },
    { label: 'Assessments', value: stats.assessments, color: 'danger' },
    { label: 'Mood Entries', value: stats.mood_entries, color: 'secondary' },
    { label: 'Journal Entries', value: stats.journal_entries, color: 'dark' },
  ];

  return (
    <Container>
      <h4>Dashboard</h4>
      <Row>
        {cards.map(c => (
          <Col md={3} sm={6} key={c.label} className="mb-3">
            <Card className={`text-white bg-${c.color}`}>
              <Card.Body>
                <div className="small">{c.label}</div>
                <h3>{c.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row>
        <Col md={6}>
          <Card className="p-3">
            <h6>Weekly New Users</h6>
            {stats.weekly_users.map(d => (
              <div key={d.date}>{d.date}: {d.count}</div>
            ))}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6>Mood Trend (last 6 months)</h6>
            {stats.mood_trend.map(d => (
              <div key={d.month}>{d.month}: {parseFloat(d.avg_mood).toFixed(2)}</div>
            ))}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;