import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MoodTracker from '../../components/MoodTracker';
import {
  Card,
  Button,
  StatCard,
  GoalCard,
  JournalCard,
  LoadingSkeleton,
} from '../../components/ui';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
    } else break;
  }
  return streak;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [moodRes, assessmentRes, journalRes, goalsRes, recRes] = await Promise.all([
        api.get('/mood/history'),
        api.get('/assessments/history'),
        api.get('/journal'),
        api.get('/goals'),
        api.get('/wellness/recommendations'),
      ]);
      setMoodHistory(moodRes.data);
      setAssessments(assessmentRes.data || []);
      setJournalEntries(journalRes.data || []);
      setGoals(goalsRes.data || []);
      setRecommendations(recRes.data || []);
      setStreak(computeStreak(moodRes.data));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const last7 = moodHistory.slice(0, 7).reverse();
  const labels = last7.map(entry => new Date(entry.recorded_at).toLocaleDateString());
  const dataPoints = last7.map(entry => entry.mood_score);

  const chartData = {
    labels: labels.length ? labels : ['No data'],
    datasets: [{
      label: 'Mood Score (1-5)',
      data: dataPoints.length ? dataPoints : [0],
      fill: false,
      backgroundColor: 'var(--color-primary-500)',
      borderColor: 'var(--color-primary-500)',
      tension: 0.2,
    }]
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
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
          <LoadingSkeleton type="avatar" className="w-100" />
        </div>
        <Row className="g-2 g-md-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <Col xs={6} md={3} key={i}>
              <LoadingSkeleton type="card" lines={2} />
            </Col>
          ))}
        </Row>
        <Row>
          <Col lg={7}>
            <LoadingSkeleton type="card" lines={5} withImage />
          </Col>
          <Col lg={5}>
            <LoadingSkeleton type="card" lines={4} />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-0">Welcome back, {displayName}!</h2>
          <p className="text-muted">Let's check in on your wellness today.</p>
        </div>
        {streak > 0 && <Badge bg="success" className="p-2">🔥 {streak}-day streak!</Badge>}
      </div>

      <Row className="g-2 g-md-3 mb-4">
        <Col xs={6} md={3}><StatCard icon="😊" value={moodHistory.length} label="Mood Entries" /></Col>
        <Col xs={6} md={3}><StatCard icon="📝" value={journalEntries.length} label="Journal Entries" /></Col>
        <Col xs={6} md={3}><StatCard icon="🎯" value={goals.filter(g => g.status === 'completed').length} label="Goals Completed" /></Col>
        <Col xs={6} md={3}><StatCard icon="🔥" value={streak} label="Day Streak" /></Col>
      </Row>

      <Row>
        <Col lg={7}>
          <Card className="p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Your Mood Trend</h6>
              <Button as={Link} to="/mood-history" variant="outline-primary" size="sm">View History</Button>
            </div>
            <div style={{ height: '200px', minHeight: '180px' }} className="mt-2">
              <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>

          <Card className="p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Assessments</h6>
              <Button as={Link} to="/assessments" variant="outline-primary" size="sm">Take New</Button>
            </div>
            {latestAssessments.length === 0 ? (
              <p className="text-muted mt-2">No assessments taken yet.</p>
            ) : (
              <Row className="mt-2 g-2">
                {latestAssessments.map((item, idx) => (
                  <Col sm={6} md={4} key={idx}>
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

          <Card className="p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Journal</h6>
              <Button as={Link} to="/journal" variant="outline-primary" size="sm">Write New</Button>
            </div>
            {recentJournals.length === 0 ? (
              <p className="text-muted mt-2">No journal entries yet.</p>
            ) : (
              <div className="mt-2">
                {recentJournals.map(entry => (
                  <JournalCard
                    key={entry.id}
                    title={entry.title || 'Untitled'}
                    content={entry.content}
                    date={entry.created_at}
                    wordCount={entry.word_count}
                    isFavorite={entry.is_favorite}
                    entryType={entry.entry_type}
                    moodAtEntry={entry.mood_at_entry}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onToggleFavorite={() => {}}
                  />
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="p-3 mb-4">
            <h6 className="fw-bold mb-0">Today's Check-in</h6>
            <MoodTracker onSave={fetchAllData} />
          </Card>

          <Card className="p-3 mb-4">
            <h6 className="fw-bold mb-2">Quick Actions</h6>
            <div className="d-grid gap-2">
              <Button as={Link} to="/assessments" variant="outline-primary">Take Assessment</Button>
              <Button as={Link} to="/journal" variant="outline-primary">Write Journal</Button>
              <Button as={Link} to="/goals" variant="outline-primary">Manage Goals</Button>
              <Button as={Link} to="/safety-plan" variant="outline-primary">Safety Plan</Button>
              <Button as={Link} to="/mood-history" variant="outline-primary">View History</Button>
              <Button as={Link} to="/wellness" variant="outline-primary">Wellness Toolkit</Button>
            </div>
          </Card>

          <Card className="p-3 mb-4">
            <h6 className="fw-bold mb-0">Recommended for You</h6>
            {recommendations.length === 0 ? (
              <p className="text-muted mt-2">No recommendations yet. Keep tracking!</p>
            ) : (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {recommendations.map((rec, idx) => (
                  <Button as={Link} to={rec.link} variant="outline-primary" key={idx} size="sm">
                    {rec.name}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Active Goals</h6>
              <Button as={Link} to="/goals" variant="outline-primary" size="sm">Manage</Button>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-muted mt-2">No active goals. Set one!</p>
            ) : (
              <div className="mt-2">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.title}
                    description={goal.description}
                    progress={goal.progress}
                    status={goal.status}
                    targetDate={goal.target_date}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onUpdateProgress={() => {}}
                  />
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
