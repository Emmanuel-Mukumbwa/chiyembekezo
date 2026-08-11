import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, StatCard, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const AdminAnalytics = () => {
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

  if (loading) {
    return (
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Analytics Dashboard</h2>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
        <Row className="g-3 mb-4">
          {[...Array(8)].map((_, i) => (
            <Col md={3} sm={6} key={i}>
              <LoadingSkeleton type="card" lines={2} />
            </Col>
          ))}
        </Row>
        <Row className="mb-4">
          {[...Array(2)].map((_, i) => (
            <Col md={6} key={i}>
              <LoadingSkeleton type="card" lines={6} />
            </Col>
          ))}
        </Row>
        <Row>
          {[...Array(2)].map((_, i) => (
            <Col md={6} key={i}>
              <LoadingSkeleton type="card" lines={4} />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <ErrorState title="Error loading analytics" description={error} onRetry={fetchStats} />
      </Container>
    );
  }

  if (!stats) return <p className="text-center mt-5">No data available.</p>;

  const weeklyLabels = stats.weekly_users.map(d => d.date);
  const weeklyCounts = stats.weekly_users.map(d => d.count);
  const weeklyData = {
    labels: weeklyLabels.length ? weeklyLabels : ['No data'],
    datasets: [{
      label: 'New Users',
      data: weeklyCounts.length ? weeklyCounts : [0],
      backgroundColor: '#2A9D8F',
      borderRadius: 6,
    }]
  };

  const moodLabels = stats.mood_trend.map(d => d.month);
  const moodValues = stats.mood_trend.map(d => parseFloat(d.avg_mood).toFixed(2));
  const moodData = {
    labels: moodLabels.length ? moodLabels : ['No data'],
    datasets: [{
      label: 'Avg Mood Score',
      data: moodValues.length ? moodValues : [0],
      borderColor: '#E9C46A',
      backgroundColor: 'rgba(233, 196, 106, 0.1)',
      tension: 0.3,
      fill: true,
    }]
  };

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Analytics Dashboard</h2>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

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

      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Weekly New Users</h6>
            <div style={{ height: '250px' }}>
              <Bar data={weeklyData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Mood Trend (Last 6 Months)</h6>
            <div style={{ height: '250px' }}>
              <Line data={moodData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Latest Users</h6>
            <div className="table-responsive">
              <Table striped hover size="sm">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {stats.latest_users && stats.latest_users.map(user => (
                    <tr key={user.id}>
                      <td>{user.first_name || 'N/A'} {user.last_name || ''}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!stats.latest_users || stats.latest_users.length === 0) && (
                    <tr><td colSpan="3" className="text-center text-muted">No users yet</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Resources Overview</h6>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span>Total Resources</span>
              <span className="fw-bold">{stats.resources?.total || 0}</span>
            </div>
            <div className="d-flex justify-content-between border-bottom py-2">
              <span>Published</span>
              <span className="fw-bold">{stats.resources?.published || 0}</span>
            </div>
            <div className="d-flex justify-content-between py-2">
              <span>Draft</span>
              <span className="fw-bold">{(stats.resources?.total || 0) - (stats.resources?.published || 0)}</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Recent Admin Actions</h6>
              <Button as={Link} to="/admin/logs" variant="outline-primary" size="sm">View All Logs</Button>
            </div>
            <div className="table-responsive">
              <Table striped hover size="sm">
                <thead>
                  <tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th></tr>
                </thead>
                <tbody>
                  {stats.recent_logs && stats.recent_logs.map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.actor_email || 'System'}</td>
                      <td>{log.action}</td>
                      <td>{log.target_type || '-'}</td>
                    </tr>
                  ))}
                  {(!stats.recent_logs || stats.recent_logs.length === 0) && (
                    <tr><td colSpan="4" className="text-center text-muted">No logs yet</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminAnalytics;
