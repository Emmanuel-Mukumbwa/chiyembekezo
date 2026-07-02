import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodLabels = { 1: 'Overwhelmed', 2: 'Sad', 3: 'Neutral', 4: 'Okay', 5: 'Happy' };
const moodEmojis = { 1: '😭', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };

const MoodHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/mood/history')
        .then(res => setHistory(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

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
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Chart data for last 30 days
  const sorted = [...history].reverse(); // oldest first for chart
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
        <Button as={Link} to="/dashboard" variant="outline-primary">
          ← Back to Dashboard
        </Button>
      </div>

      <Card className="feature-card p-3 mb-4">
        <Card.Title>Mood Trend (Last 30 days)</Card.Title>
        <div style={{ height: '250px' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </Card>

      <Card className="feature-card p-3">
        <Card.Title>Entries</Card.Title>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood</th>
              <th>Energy</th>
              <th>Stress</th>
              <th>Sleep</th>
              <th>Exercise</th>
              <th>Water</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No entries yet. Start tracking today!</td></tr>
            ) : (
              history.map((entry, idx) => (
                <tr key={idx}>
                  <td>{new Date(entry.recorded_at).toLocaleDateString()}</td>
                  <td>
                    <span className="me-1">{moodEmojis[entry.mood_score]}</span>
                    {moodLabels[entry.mood_score]}
                  </td>
                  <td>{entry.energy || '-'}</td>
                  <td>{entry.stress || '-'}</td>
                  <td>{entry.sleep || '-'}</td>
                  <td>{entry.exercise || '-'}</td>
                  <td>{entry.water || '-'}</td>
                  <td>{entry.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default MoodHistory;