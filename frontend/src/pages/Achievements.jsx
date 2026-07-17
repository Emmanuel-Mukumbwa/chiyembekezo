import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const [achievementsRes, pointsRes] = await Promise.all([
        api.get('/achievements'),
        api.get('/achievements/points'),
      ]);
      setAchievements(achievementsRes.data);
      setTotalPoints(pointsRes.data.total_points);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to view your achievements.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Group by category
  const grouped = {};
  achievements.forEach(a => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏆 Achievements</h2>
        <div>
          <Badge bg="success" className="me-2">Points: {totalPoints}</Badge>
          <Badge bg="info">{earnedCount} / {totalCount} earned</Badge>
          <Button as={Link} to="/dashboard" variant="outline-secondary" className="ms-2">← Back</Button>
        </div>
      </div>

      {Object.keys(grouped).map(category => (
        <div key={category} className="mb-4">
          <h5 className="text-muted">{category}</h5>
          <Row>
            {grouped[category].map(ach => (
              <Col md={3} sm={6} key={ach.id} className="mb-3">
                <Card className={`feature-card h-100 ${ach.earned ? 'border-success' : 'border-light'}`}>
                  <Card.Body className="text-center">
                    <div style={{ fontSize: '3rem' }}>{ach.icon || '🏅'}</div>
                    <Card.Title className="h6 mt-2">{ach.name}</Card.Title>
                    <Card.Text className="small text-muted">{ach.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg="secondary">+{ach.points} pts</Badge>
                      {ach.earned ? (
                        <Badge bg="success">✅ Earned</Badge>
                      ) : (
                        <Badge bg="light" text="dark">🔒 Locked</Badge>
                      )}
                    </div>
                    {ach.earned && ach.earned_at && (
                      <div className="mt-1 small text-muted">
                        Earned: {new Date(ach.earned_at).toLocaleDateString()}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
};

export default Achievements;