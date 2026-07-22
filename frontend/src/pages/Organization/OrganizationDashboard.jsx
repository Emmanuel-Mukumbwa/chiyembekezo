import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const OrganizationDashboard = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Spinner animation="border" />;
  if (!stats) return <p>No data available.</p>;

  return (
    <Container>
      <h4>{org?.name || 'Organization'} Dashboard</h4>
      <Row>
        <Col md={3}><Card className="text-center p-2"><h6>Total Members</h6><h3>{stats.total_members}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Avg Mood</h6><h3>{stats.mood_avg}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Avg Stress</h6><h3>{stats.stress_avg}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Engagement Rate</h6><h3>{stats.engagement_rate}%</h3></Card></Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Card className="p-3">
            <h6>Mood Distribution</h6>
            {stats.mood_distribution.map(d => (
              <div key={d.mood_score}>Mood {d.mood_score}: {d.count}</div>
            ))}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6>Top Wellness Activities</h6>
            {stats.top_wellness_types.length > 0 ? stats.top_wellness_types.map(w => (
              <div key={w.type}>{w.type}: {w.count}</div>
            )) : <span>None</span>}
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={4}><Card className="p-2"><h6>Assessments</h6><h4>{stats.assessment_count}</h4></Card></Col>
        <Col md={4}><Card className="p-2"><h6>Journal Entries</h6><h4>{stats.journal_count}</h4></Card></Col>
        <Col md={4}><Card className="p-2"><h6>Wellness Sessions</h6><h4>{stats.wellness_sessions}</h4></Card></Col>
      </Row>
    </Container>
  );
};

export default OrganizationDashboard;