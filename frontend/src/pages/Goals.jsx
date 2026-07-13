import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Modal, ProgressBar, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Goals = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'active',
    progress: 0,
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [goalsRes, habitsRes, templatesRes] = await Promise.all([
        api.get('/goals'),
        api.get('/habits'),
        api.get('/habits/templates'),
      ]);
      setGoals(goalsRes.data);
      setHabits(habitsRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (err) {
      showModal('Error', 'Failed to load data.');
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
      fetchAllData();
    } catch (err) {
      showModal('Error', 'Failed to save goal.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        fetchAllData();
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

  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description || '',
      target_date: '',
      status: 'active',
      progress: 0,
    });
    setShowTemplateModal(false);
    setShowModalGoal(true);
  };

  const statusBadge = (status) => {
    const variants = { active: 'primary', completed: 'success', archived: 'secondary' };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Count habits linked to each goal
  const getHabitCount = (goalId) => {
    return habits.filter(h => h.goal_id === goalId).length;
  };

  // Progress bar variant
  const progressVariant = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
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
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowTemplateModal(true)}>
            📋 Templates
          </Button>
          <Button variant="primary" onClick={() => { setEditingGoal(null); setFormData({ title: '', description: '', target_date: '', status: 'active', progress: 0 }); setShowModalGoal(true); }}>
            + New Goal
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-secondary">
            ← Back
          </Button>
        </div>
      </div>

      <Row>
        {goals.length === 0 ? (
          <p className="text-muted text-center">No goals yet. Create one or use a template!</p>
        ) : (
          goals.map(goal => (
            <Col md={6} lg={4} key={goal.id} className="mb-3">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <Card.Title className="h5">{goal.title}</Card.Title>
                    {statusBadge(goal.status)}
                  </div>
                  <Card.Text className="text-muted small">{goal.description || 'No description'}</Card.Text>

                  <div className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <ProgressBar
                      now={goal.progress}
                      variant={progressVariant(goal.progress)}
                      style={{ height: '8px' }}
                    />
                  </div>

                  <div className="d-flex justify-content-between small text-muted">
                    <span>🧩 {getHabitCount(goal.id)} habits</span>
                    {goal.target_date && <span>📅 {new Date(goal.target_date).toLocaleDateString()}</span>}
                  </div>

                  <div className="mt-3">
                    <Button variant="outline-primary" size="sm" onClick={() => openEdit(goal)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => handleDelete(goal.id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Template Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Choose a Goal Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {templates.length === 0 ? (
            <p className="text-muted">No templates available.</p>
          ) : (
            <Row>
              {templates.map(template => (
                <Col md={6} key={template.id} className="mb-3">
                  <Card className="feature-card h-100">
                    <Card.Body>
                      <Card.Title className="h6">{template.title}</Card.Title>
                      <Card.Text className="small text-muted">{template.description}</Card.Text>
                      {template.suggested_habits && (
                        <div className="small">
                          <strong>Suggested habits:</strong>
                          <ul className="list-unstyled">
                            {JSON.parse(template.suggested_habits).map((h, i) => (
                              <li key={i}>• {h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Button variant="outline-primary" size="sm" onClick={() => applyTemplate(template)}>
                        Use Template
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Create/Edit Modal */}
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