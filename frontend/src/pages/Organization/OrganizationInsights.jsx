import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Card, StatCard, ErrorState, LoadingSkeleton } from '../../components/ui';

const OrganizationInsights = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/organization/insights');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load insights.');
      showModal('Error', 'Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Organization Insights</h4>
      <Row className="g-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <Col xs={6} md={3} key={i}><LoadingSkeleton type="card" lines={2} /></Col>
        ))}
      </Row>
      <Row>
        <Col xs={12} md={6}><LoadingSkeleton type="article" lines={5} /></Col>
        <Col xs={12} md={6}><LoadingSkeleton type="article" lines={5} /></Col>
      </Row>
    </Container>
  );
  if (error) return <ErrorState title="Error loading insights" description={error} onRetry={fetchInsights} />;
  if (!stats) return <p className="text-center mt-5">No data available.</p>;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Organization Insights</h4>
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard icon="👥" value={stats.total_members} label="Total Members" variant="info" /></Col>
        <Col xs={6} md={3}><StatCard icon="😊" value={stats.mood_avg} label="Avg Mood" variant="primary" /></Col>
        <Col xs={6} md={3}><StatCard icon="😰" value={stats.stress_avg} label="Avg Stress" variant="warning" /></Col>
        <Col xs={6} md={3}><StatCard icon="📊" value={`${stats.engagement_rate}%`} label="Engagement" variant="success" /></Col>
      </Row>

      <Row>
        <Col xs={12} md={6}>
          <Card className="p-3 mb-3">
            <h6 className="fw-bold">Mood Distribution</h6>
            {stats.mood_distribution && stats.mood_distribution.map(d => (
              <div key={d.mood_score} className="d-flex justify-content-between border-bottom py-1">
                <span>Mood {d.mood_score}</span>
                <span>{d.count}</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="p-3 mb-3">
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
    </Container>
  );
};

export default OrganizationInsights;
