import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import { Card, Button, StatCard } from '../../components/ui';

const OrganizationDashboard = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [org, setOrg] = useState(null);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orgRes, statsRes] = await Promise.all([
        api.get('/organization/me'),
        api.get('/organization/stats'),
      ]);
      setOrg(orgRes.data);
      setStats(statsRes.data);
    } catch (err) {
      showModal('Error', 'Failed to load organization data.');
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
  if (!stats) return <p className="text-center mt-5">No data available.</p>;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{org?.name || 'Organization'} Dashboard</h2>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}><StatCard icon="👥" value={stats.total_members} label="Total Members" variant="info" /></Col>
        <Col md={3} sm={6}><StatCard icon="😊" value={stats.mood_avg} label="Avg Mood" variant="primary" /></Col>
        <Col md={3} sm={6}><StatCard icon="😰" value={stats.stress_avg} label="Avg Stress" variant="warning" /></Col>
        <Col md={3} sm={6}><StatCard icon="📊" value={`${stats.engagement_rate}%`} label="Engagement" variant="success" /></Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Mood Distribution</h6>
            {stats.mood_distribution && stats.mood_distribution.map(d => (
              <div key={d.mood_score} className="d-flex justify-content-between border-bottom py-1">
                <span>Mood {d.mood_score}</span>
                <span>{d.count}</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6 className="fw-bold">Top Wellness Activities</h6>
            {stats.top_wellness_types && stats.top_wellness_types.length > 0 ? (
              stats.top_wellness_types.map(w => (
                <div key={w.type} className="d-flex justify-content-between border-bottom py-1">
                  <span>{w.type}</span>
                  <span>{w.count}</span>
                </div>
              ))
            ) : <span className="text-muted">None</span>}
          </Card>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={4}><Card className="p-3 text-center"><h6>Assessments</h6><h3 className="fw-bold">{stats.assessment_count}</h3></Card></Col>
        <Col md={4}><Card className="p-3 text-center"><h6>Journal Entries</h6><h3 className="fw-bold">{stats.journal_count}</h3></Card></Col>
        <Col md={4}><Card className="p-3 text-center"><h6>Wellness Sessions</h6><h3 className="fw-bold">{stats.wellness_sessions}</h3></Card></Col>
      </Row>
    </Container>
  );
};

export default OrganizationDashboard;
