import React, { useEffect, useState } from 'react';
import { Row, Col, Badge, Card, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import MoodTracker from '../../components/MoodTracker';
import {
  Card as UICard,
  Button,
  StatCard,
  JournalCard,
  LoadingSkeleton,
} from '../../components/ui';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  const { showModal } = useModal();
  const navigate = useNavigate();
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

  const handleEditJournal = (entry) => navigate('/journal');
  const handleDeleteJournal = async (id) => {
    showModal('Confirm Delete', 'Delete this journal entry?', async () => {
      try {
        await api.delete(`/journal/${id}`);
        fetchAllData();
      } catch { showModal('Error', 'Failed to delete.'); }
    });
  };
  const handleToggleFavorite = async (id, isFavorite) => {
    try {
      await api.put(`/journal/${id}`, { is_favorite: !isFavorite });
      setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, is_favorite: !isFavorite } : e));
    } catch { showModal('Error', 'Failed to update.'); }
  };

  const handleIncrementProgress = async (id, current) => {
    const newVal = Math.min(current + 10, 100);
    try {
      await api.put(`/goals/${id}`, { progress: newVal });
      setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newVal } : g));
    } catch { showModal('Error', 'Failed to update progress.'); }
  };

  const handleCompleteGoal = async (id) => {
    try {
      await api.put(`/goals/${id}`, { status: 'completed' });
      showModal('Success', 'Goal completed!');
      fetchAllData();
    } catch { showModal('Error', 'Failed to complete goal.'); }
  };

  const handleDeleteGoal = async (id) => {
    showModal('Confirm Delete', 'Delete this goal?', async () => {
      try {
        await api.delete(`/goals/${id}`);
        fetchAllData();
      } catch { showModal('Error', 'Failed to delete.'); }
    });
  };

  const last7 = moodHistory.slice(0, 7).reverse();
  const labels = last7.map(e => new Date(e.recorded_at).toLocaleDateString());
  const dataPoints = last7.map(e => e.mood_score);
  const chartData = {
    labels: labels.length ? labels : ['No data'],
    datasets: [{
      label: 'Mood Score',
      data: dataPoints.length ? dataPoints : [0],
      fill: false,
      borderColor: '#0d6efd',
      tension: 0.2,
    }],
  };

  const displayName = user?.firstName || user?.email || 'User';
  const latestAssessments = assessments.slice(0, 3);
  const recentJournals = journalEntries.slice(0, 3);
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h3>Please log in to view your dashboard.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-3 px-md-4 py-4">
        <Row className="mb-4">
          <Col><LoadingSkeleton type="avatar" /></Col>
        </Row>
        <Row className="g-3 mb-4">
          {[1,2,3,4].map(i => <Col xs={6} md={3} key={i}><LoadingSkeleton type="card" lines={2} /></Col>)}
        </Row>
        <Row className="g-3">
          <Col md={8}><LoadingSkeleton type="card" lines={6} /></Col>
          <Col md={4}><LoadingSkeleton type="card" lines={4} /></Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="px-3 px-md-4 py-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-primary text-white rounded-3 shadow-sm">
        <div>
          <h2 className="mb-0">Welcome back, {displayName}!</h2>
          <p className="mb-0 opacity-75">Let's check in on your wellness today.</p>
        </div>
        {streak > 0 && (
          <Badge bg="light" text="dark" className="fs-6 mt-2 mt-sm-0">
            🔥 {streak}-day streak!
          </Badge>
        )}
      </div>

      {/* Stats Row */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard icon="😊" value={moodHistory.length} label="Mood Entries" variant="primary" /></Col>
        <Col xs={6} md={3}><StatCard icon="📝" value={journalEntries.length} label="Journal Entries" variant="success" /></Col>
        <Col xs={6} md={3}><StatCard icon="🎯" value={goals.filter(g => g.status === 'completed').length} label="Goals Done" variant="warning" /></Col>
        <Col xs={6} md={3}><StatCard icon="🔥" value={streak} label="Day Streak" variant="danger" /></Col>
      </Row>

      {/* Main Content */}
      <Row className="g-3">
        {/* Left Column */}
        <Col lg={8}>
          {/* Mood Chart */}
          <UICard className="p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Your Mood Trend</h6>
              <Button as={Link} to="/mood-history" variant="outline-primary" size="sm">View History</Button>
            </div>
            <div className="mt-2" style={{ height: '200px' }}>
              <Line data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </UICard>

          {/* Recent Assessments */}
          <UICard className="p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Assessments</h6>
              <Button as={Link} to="/assessments" variant="outline-primary" size="sm">Take New</Button>
            </div>
            {latestAssessments.length === 0 ? (
              <p className="text-muted mt-2">No assessments yet. Take your first one!</p>
            ) : (
              <Row className="mt-2 g-2">
                {latestAssessments.map((item, idx) => (
                  <Col xs={6} md={4} key={idx}>
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
          </UICard>

          {/* Recent Journals */}
          <UICard className="p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Journal</h6>
              <Button as={Link} to="/journal" variant="outline-primary" size="sm">Write New</Button>
            </div>
            {recentJournals.length === 0 ? (
              <p className="text-muted mt-2">No journal entries yet. Write your first one!</p>
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
                    onEdit={() => handleEditJournal(entry)}
                    onDelete={() => handleDeleteJournal(entry.id)}
                    onToggleFavorite={() => handleToggleFavorite(entry.id, entry.is_favorite)}
                  />
                ))}
              </div>
            )}
          </UICard>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          {/* Mood Check-in */}
          <UICard className="p-3 mb-3">
            <h6 className="fw-bold mb-3">Today's Check-in</h6>
            <MoodTracker onSave={fetchAllData} />
          </UICard>

          {/* Quick Actions */}
          <UICard className="p-3 mb-3">
            <h6 className="fw-bold mb-3">Quick Actions</h6>
            <div className="d-grid gap-2">
              <Button as={Link} to="/assessments" variant="outline-primary" size="sm" className="text-start">📊 Take Assessment</Button>
              <Button as={Link} to="/journal" variant="outline-primary" size="sm" className="text-start">📓 Write Journal</Button>
              <Button as={Link} to="/goals" variant="outline-primary" size="sm" className="text-start">🎯 Manage Goals</Button>
              <Button as={Link} to="/safety-plan" variant="outline-primary" size="sm" className="text-start">🛡️ Safety Plan</Button>
              <Button as={Link} to="/wellness" variant="outline-primary" size="sm" className="text-start">🧘 Wellness Toolkit</Button>
            </div>
          </UICard>

          {/* Recommendations */}
          <UICard className="p-3 mb-3">
            <h6 className="fw-bold mb-3">Recommended for You</h6>
            {recommendations.length === 0 ? (
              <p className="text-muted mt-2">Keep tracking to get recommendations.</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {recommendations.map((rec, idx) => (
                  <Button as={Link} to={rec.link} variant="outline-primary" key={idx} size="sm">{rec.name}</Button>
                ))}
              </div>
            )}
          </UICard>

          {/* Active Goals */}
          <UICard className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Active Goals</h6>
              <Button as={Link} to="/goals" variant="outline-primary" size="sm">Manage</Button>
            </div>
            {activeGoals.length === 0 ? (
              <p className="text-muted mt-2">No active goals. Set one!</p>
            ) : (
              activeGoals.map(goal => (
                <Card key={goal.id} className="mb-2 shadow-sm">
                  <Card.Body>
                    <h6>{goal.title}</h6>
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>{goal.description}</span>
                      <span>Due: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : '-'}</span>
                    </div>
                    <ProgressBar now={goal.progress} label={`${goal.progress}%`} className="mb-2" />
                    <div className="d-flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline-secondary" onClick={() => handleIncrementProgress(goal.id, goal.progress)}>+10%</Button>
                      <Button size="sm" variant="outline-success" onClick={() => handleCompleteGoal(goal.id)}>Complete</Button>
                      <Button size="sm" variant="outline-primary" onClick={() => navigate('/goals')}>Edit</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteGoal(goal.id)}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </UICard>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
