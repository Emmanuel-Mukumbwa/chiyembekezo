import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Table, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Habits = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalHabit, setShowModalHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    target_value: 1,
    unit: 'times',
    frequency: 'daily',
    goal_id: null,
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitsRes, todayRes, achievementsRes] = await Promise.all([
        api.get('/habits'),
        api.get('/habits/today/logs'),
        api.get('/habits/achievements'),
      ]);
      setHabits(habitsRes.data);
      setTodayLogs(todayRes.data);
      setAchievements(achievementsRes.data);
    } catch (err) {
      showModal('Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (habitId, value = 1) => {
    try {
      await api.post('/habits/log', { habitId, value });
      showModal('Success', 'Habit logged!');
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to log habit.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to delete.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit.id}`, formData);
      } else {
        await api.post('/habits', formData);
      }
      setShowModalHabit(false);
      setEditingHabit(null);
      setFormData({ name: '', category: 'general', target_value: 1, unit: 'times', frequency: 'daily', goal_id: null });
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to save habit.');
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Habits</h2>
        <div>
          <Button variant="primary" onClick={() => { setEditingHabit(null); setFormData({ name: '', category: 'general', target_value: 1, unit: 'times', frequency: 'daily', goal_id: null }); setShowModalHabit(true); }}>
            + New Habit
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-secondary" className="ms-2">← Back</Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="feature-card p-3 mb-4">
            <h5>Today's Checklist</h5>
            {todayLogs.length === 0 ? (
              <p className="text-muted">No habits defined yet. Create one!</p>
            ) : (
              <div className="d-flex flex-wrap gap-2">
                {todayLogs.map(habit => (
                  <Button
                    key={habit.id}
                    variant={habit.logged ? 'success' : 'outline-secondary'}
                    onClick={() => handleLog(habit.id)}
                    className="d-flex align-items-center gap-2"
                  >
                    {habit.logged ? '✅' : '☑️'} {habit.name}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          <Card className="feature-card p-3">
            <h5>All Habits</h5>
            <Table striped hover responsive>
              <thead>
                <tr><th>Name</th><th>Category</th><th>Target</th><th>Frequency</th><th>Goal</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {habits.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">No habits</td></tr>
                ) : (
                  habits.map(habit => (
                    <tr key={habit.id}>
                      <td>{habit.name}</td>
                      <td><Badge bg="secondary">{habit.category}</Badge></td>
                      <td>{habit.target_value} {habit.unit}</td>
                      <td>{habit.frequency}</td>
                      <td>{habit.goal_title || '-'}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => { setEditingHabit(habit); setFormData(habit); setShowModalHabit(true); }}>Edit</Button>
                        <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => handleDelete(habit.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="feature-card p-3 mb-4">
            <h5>Achievements 🏆</h5>
            {achievements.length === 0 ? (
              <p className="text-muted">No achievements yet. Keep tracking!</p>
            ) : (
              <ul className="list-unstyled">
                {achievements.map(a => (
                  <li key={a.id} className="border-bottom py-1">
                    <strong>{a.achievement_type.replace('_', ' ')}</strong>
                    <div className="small text-muted">{new Date(a.achieved_at).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="feature-card p-3">
            <h5>Quick Stats</h5>
            <p>Total habits: {habits.length}</p>
            <p>Today logged: {todayLogs.filter(h => h.logged).length} / {todayLogs.length}</p>
            <p>Achievements: {achievements.length}</p>
          </Card>
        </Col>
      </Row>

      {/* Modal for creating/editing habit */}
      <Modal show={showModalHabit} onHide={() => setShowModalHabit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingHabit ? 'Edit Habit' : 'New Habit'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="exercise">Exercise</option>
                <option value="nutrition">Nutrition</option>
                <option value="mental_health">Mental Health</option>
                <option value="sleep">Sleep</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target Value</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Related Goal (optional)</Form.Label>
              <Form.Select
                value={formData.goal_id || ''}
                onChange={(e) => setFormData({ ...formData, goal_id: e.target.value || null })}
              >
                <option value="">None</option>
                {/* We would fetch user goals here */}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalHabit(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Habits;