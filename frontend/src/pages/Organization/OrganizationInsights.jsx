import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const OrganizationInsights = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organization/insights');
      setStats(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;
  if (!stats) return <p>No data available.</p>;

  return (
    <Container>
      <h4>Organization Insights</h4>
      <Row>
        <Col md={3}>
          <Card className="text-center p-2"><h6>Total Members</h6><h3>{stats.total_members}</h3></Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-2"><h6>Avg Mood</h6><h3>{stats.mood_avg}</h3></Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-2"><h6>Avg Stress</h6><h3>{stats.stress_avg}</h3></Card>
        </Col>
        <Col md={3}>
          <Card className="text-center p-2"><h6>Engagement</h6><h3>{stats.engagement_rate}%</h3></Card>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6}>
          <Card className="p-3">
            <h6>Mood Distribution</h6>
            {stats.mood_distribution && stats.mood_distribution.map(d => (
              <div key={d.mood_score}>Mood {d.mood_score}: {d.count}</div>
            ))}
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h6>Top Wellness Activities</h6>
            {stats.top_wellness_types && stats.top_wellness_types.length > 0 ? (
              stats.top_wellness_types.map(w => <div key={w.type}>{w.type}: {w.count}</div>)
            ) : <span>None</span>}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrganizationInsights;