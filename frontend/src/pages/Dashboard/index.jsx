import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MoodTracker from '../../components/MoodTracker';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    }
  }, [user]);

  const fetchMoodHistory = async () => {
    try {
      const res = await api.get('/mood/history');
      setMoodHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data (last 7 days)
  const last7 = moodHistory.slice(0, 7).reverse();
  const labels = last7.map(entry => new Date(entry.recorded_at).toLocaleDateString());
  const dataPoints = last7.map(entry => entry.mood_score);

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

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to view your dashboard.</h3>
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

  return (
    <Container className="my-4">
      <h2 className="mb-3">Welcome back, {user.name || 'User'}!</h2>
      <Row>
        <Col lg={8}>
          <Card className="feature-card p-3 mb-4">
            <Card.Title>Your Mood Trend</Card.Title>
            <div style={{ height: '250px' }}>
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="feature-card p-3 mb-4">
            <Card.Title>Quick Actions</Card.Title>
            <div className="d-grid gap-2">
              <Button as={Link} to="/assessments" variant="outline-primary">Take Assessment</Button>
              <Button as={Link} to="/journal" variant="outline-primary">Write Journal</Button>
              <Button as={Link} to="/ai" variant="outline-primary">Talk to AI</Button>
            </div>
          </Card>
          <MoodTracker onSave={fetchMoodHistory} />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;