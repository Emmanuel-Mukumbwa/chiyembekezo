import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoadingSkeleton } from '../components/ui';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { FiFilter, FiX } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodLabels = { 1: 'Overwhelmed', 2: 'Sad', 3: 'Neutral', 4: 'Okay', 5: 'Happy' };
const moodEmojis = { 1: '😭', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };

const MoodCard = ({ entry }) => (
  <Card className="mb-2 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <span className="me-2" style={{ fontSize: '1.5rem' }}>{moodEmojis[entry.mood_score]}</span>
          <strong>{moodLabels[entry.mood_score]}</strong>
        </div>
        <small className="text-muted">{new Date(entry.recorded_at).toLocaleDateString()}</small>
      </div>
      <div className="row mt-2 small">
        <div className="col-4">Energy: {entry.energy || '-'}</div>
        <div className="col-4">Stress: {entry.stress || '-'}</div>
        <div className="col-4">Sleep: {entry.sleep || '-'}</div>
        <div className="col-4">Exercise: {entry.exercise || '-'}</div>
        <div className="col-4">Water: {entry.water || '-'}</div>
        <div className="col-8">Notes: {entry.notes || '-'}</div>
      </div>
    </Card.Body>
  </Card>
);

const MoodHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => {
    if (user) {
      api.get('/mood/history')
        .then(res => setHistory(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const filteredHistory = history.filter(entry => {
    const dateStr = new Date(entry.recorded_at).toLocaleDateString();
    return dateStr.includes(appliedSearch) || (entry.notes || '').toLowerCase().includes(appliedSearch.toLowerCase());
  });

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to view your mood history.</h3>
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
        <Card className="feature-card p-3 mb-4">
          <LoadingSkeleton type="article" lines={5} />
        </Card>
        <LoadingSkeleton type="list" />
      </Container>
    );
  }

  const sorted = [...history].reverse();
  const labels = sorted.map(entry => new Date(entry.recorded_at).toLocaleDateString());
  const dataPoints = sorted.map(entry => entry.mood_score);

  const chartData = {
    labels: labels.length ? labels : ['No data'],
    datasets: [
      {
        label: 'Mood Score (1-5)',
        data: dataPoints.length ? dataPoints : [0],
        fill: false,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        tension: 0.2,
      }
    ]
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Mood History</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-primary">← Back to Dashboard</Button>
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <input
                className="form-control"
                placeholder="Search by date or notes..."
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

      <Card className="feature-card p-3 mb-4">
        <Card.Title>Mood Trend (Last 30 days)</Card.Title>
        <div style={{ height: '250px' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </Card>

      <Card className="feature-card p-3">
        <Card.Title>Entries</Card.Title>
        <div className="d-none d-md-block">
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Date</th><th>Mood</th><th>Energy</th><th>Stress</th><th>Sleep</th><th>Exercise</th><th>Water</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan="8" className="text-center">No entries yet. Start tracking today!</td></tr>
              ) : (
                filteredHistory.map((entry, idx) => (
                  <tr key={idx}>
                    <td>{new Date(entry.recorded_at).toLocaleDateString()}</td>
                    <td><span className="me-1">{moodEmojis[entry.mood_score]}</span>{moodLabels[entry.mood_score]}</td>
                    <td>{entry.energy || '-'}</td><td>{entry.stress || '-'}</td><td>{entry.sleep || '-'}</td><td>{entry.exercise || '-'}</td><td>{entry.water || '-'}</td><td>{entry.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div className="d-md-none">
          {filteredHistory.length === 0 ? (
            <p className="text-center text-muted">No entries match.</p>
          ) : (
            filteredHistory.map((entry, idx) => <MoodCard key={idx} entry={entry} />)
          )}
        </div>
      </Card>
    </Container>
  );
};

export default MoodHistory;
