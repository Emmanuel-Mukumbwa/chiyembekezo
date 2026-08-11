import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/ui';
import api from '../services/api';
import { FiFilter, FiX } from 'react-icons/fi';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => { if (user) fetchAchievements(); }, [user]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const [achievementsRes, pointsRes] = await Promise.all([
        api.get('/achievements'),
        api.get('/achievements/points'),
      ]);
      setAchievements(achievementsRes.data);
      setTotalPoints(pointsRes.data.total_points);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const filteredAchievements = achievements.filter(ach =>
    ach.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
    ach.description.toLowerCase().includes(appliedSearch.toLowerCase()) ||
    ach.category.toLowerCase().includes(appliedSearch.toLowerCase())
  );

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
      <Container className="my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <LoadingSkeleton type="article" lines={2} className="flex-grow-1" />
        </div>
        <Row>
          {[...Array(8)].map((_, i) => (
            <Col md={3} sm={6} key={i} className="mb-3">
              <LoadingSkeleton type="card" lines={3} />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  const grouped = {};
  filteredAchievements.forEach(a => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });

  const earnedCount = filteredAchievements.filter(a => a.earned).length;
  const totalCount = filteredAchievements.length;

  return (
    <Container className="my-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2>🏆 Achievements</h2>
        <div className="d-flex gap-2 align-items-center">
          <Badge bg="success" className="me-2">Points: {totalPoints}</Badge>
          <Badge bg="info">{earnedCount} / {totalCount} earned</Badge>
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1 ms-2">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-secondary" className="ms-2">← Back</Button>
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <input
                className="form-control"
                placeholder="Search achievements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

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
