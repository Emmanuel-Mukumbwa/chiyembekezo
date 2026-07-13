import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Goals = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'active',
    progress: 0,
  });

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, formData);
        showModal('Success', 'Goal updated!');
      } else {
        await api.post('/goals', formData);
        showModal('Success', 'Goal created!');
      }
      setShowModalGoal(false);
      setEditingGoal(null);
      setFormData({ title: '', description: '', target_date: '', status: 'active', progress: 0 });
      fetchGoals();
    } catch (err) {
      showModal('Error', 'Failed to save goal.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchGoals();
        showModal('Success', 'Goal deleted.');
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    }
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      status: goal.status,
      progress: goal.progress || 0,
    });
    setShowModalGoal(true);
  };

  const statusBadge = (status) => {
    const variants = { active: 'primary', completed: 'success', archived: 'secondary' };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to manage your goals.</h3>
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
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Goals</h2>
        <div>
          <Button variant="primary" onClick={() => { setEditingGoal(null); setFormData({ title: '', description: '', target_date: '', status: 'active', progress: 0 }); setShowModalGoal(true); }}>
            + New Goal
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-secondary" className="ms-2">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <Row>
        {goals.length === 0 ? (
          <p className="text-muted text-center">No goals yet. Create one to start tracking!</p>
        ) : (
          goals.map(goal => (
            <Col md={6} lg={4} key={goal.id} className="mb-3">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <Card.Title>{goal.title}</Card.Title>
                    {statusBadge(goal.status)}
                  </div>
                  <Card.Text className="text-muted small">{goal.description || 'No description'}</Card.Text>
                  <div className="d-flex justify-content-between small">
                    <span>Progress: {goal.progress}%</span>
                    {goal.target_date && <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>}
                  </div>
                  <div className="mt-2">
                    <Button variant="outline-primary" size="sm" onClick={() => openEdit(goal)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => handleDelete(goal.id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Edit/Create Modal */}
      <Modal show={showModalGoal} onHide={() => setShowModalGoal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingGoal ? 'Edit Goal' : 'New Goal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Progress (0-100)</Form.Label>
              <Form.Control
                type="number"
                min="0" max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalGoal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Goals; 