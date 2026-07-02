import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MoodTracker from '../../components/MoodTracker';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Helper: compute mood streak (consecutive days with entries)
const computeStreak = (history) => {
  if (!history || history.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < history.length; i++) {
    const entryDate = new Date(history[i].recorded_at);
    entryDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [moodRes, assessmentRes, journalRes, goalsRes] = await Promise.all([
        api.get('/mood/history'),
        api.get('/assessments/history'),
        api.get('/journal'),
        api.get('/goals'),
      ]);
      setMoodHistory(moodRes.data);
      setAssessments(assessmentRes.data || []);
      setJournalEntries(journalRes.data || []);
      setGoals(goalsRes.data || []);
      setStreak(computeStreak(moodRes.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data (last 7 days)
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

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName || user?.email || 'User';

  const latestAssessments = assessments.slice(0, 3);
  const recentJournals = journalEntries.slice(0, 3);
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

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
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <h2>Welcome back, {displayName}!</h2>
        {streak > 0 && (
          <Badge bg="success" className="p-2">
            🔥 {streak}-day streak!
          </Badge>
        )}
      </div>

      <Row>
        <Col lg={7}>
          {/* Mood Trend */}
          <Card className="feature-card p-3 mb-4">
            <Card.Title>
              Your Mood Trend
              <Button as={Link} to="/mood-history" variant="link" size="sm" className="float-end">
                View History
              </Button>
            </Card.Title>
            <div style={{ height: '250px' }}>
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>

          {/* Recent Assessments */}
          <Card className="feature-card p-3 mb-4">
            <Card.Title className="d-flex justify-content-between">
              <span>Recent Assessments</span>
              <Button as={Link} to="/assessments" variant="outline-primary" size="sm">
                Take New
              </Button>
            </Card.Title>
            {latestAssessments.length === 0 ? (
              <p className="text-muted">No assessments taken yet.</p>
            ) : (
              <Row>
                {latestAssessments.map((item, idx) => (
                  <Col sm={6} md={4} key={idx} className="mb-2">
                    <div className="border rounded p-2 text-center">
                      <div className="small text-muted">{item.assessment_type}</div>
                      <div className="fw-bold">{item.severity_level}</div>
                      <div className="small">Score: {item.score}</div>
                      <div className="small text-muted">{new Date(item.taken_at).toLocaleDateString()}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Card>

          {/* Recent Journal Entries */}
          <Card className="feature-card p-3 mb-4">
            <Card.Title className="d-flex justify-content-between">
              <span>Recent Journal</span>
              <Button as={Link} to="/journal" variant="outline-primary" size="sm">
                Write New
              </Button>
            </Card.Title>
            {recentJournals.length === 0 ? (
              <p className="text-muted">No journal entries yet.</p>
            ) : (
              <ul className="list-unstyled">
                {recentJournals.map(entry => (
                  <li key={entry.id} className="border-bottom py-2">
                    <strong>{entry.title || 'Untitled'}</strong>
                    <div className="text-muted small">{new Date(entry.created_at).toLocaleDateString()}</div>
                    <div className="small">{entry.content.substring(0, 80)}...</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>

        <Col lg={5}>
          {/* Today's Check-in */}
          <Card className="feature-card p-3 mb-4">
            <Card.Title>Today's Check-in</Card.Title>
            <MoodTracker onSave={fetchAllData} />
          </Card>

          {/* Quick Actions */}
          <Card className="feature-card p-3 mb-4">
            <Card.Title>Quick Actions</Card.Title>
            <div className="d-grid gap-2">
              <Button as={Link} to="/assessments" variant="outline-primary">Take Assessment</Button>
              <Button as={Link} to="/journal" variant="outline-primary">Write Journal</Button>
              <Button as={Link} to="/goals" variant="outline-primary">Manage Goals</Button>
              <Button as={Link} to="/safety-plan" variant="outline-primary">Safety Plan</Button>
              <Button as={Link} to="/mood-history" variant="outline-primary">View History</Button>
            </div>
          </Card>

          {/* Active Goals */}
          <Card className="feature-card p-3">
            <Card.Title className="d-flex justify-content-between">
              <span>Active Goals</span>
              <Button as={Link} to="/goals" variant="outline-primary" size="sm">Manage</Button>
            </Card.Title>
            {activeGoals.length === 0 ? (
              <p className="text-muted">No active goals. Set one!</p>
            ) : (
              <ul className="list-unstyled">
                {activeGoals.map(goal => (
                  <li key={goal.id} className="border-bottom py-1">
                    <strong>{goal.title}</strong>
                    <div className="small text-muted">Progress: {goal.progress}%</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;