import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  Textarea,
  DataTable,
  EmptyState,
  ErrorState,
  SectionTitle,
  LoadingSkeleton,
} from '../components/ui';
import api from '../services/api';

const Goals = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'active',
    progress: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      setError('Failed to load goals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
      showModal('Error', err.response?.data?.error || 'Failed to save goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
      showModal('Success', 'Goal deleted.');
    } catch (err) {
      showModal('Error', 'Failed to delete.');
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

  const openCreate = () => {
    setEditingGoal(null);
    setFormData({ title: '', description: '', target_date: '', status: 'active', progress: 0 });
    setShowModalGoal(true);
  };

  const columns = [
    { field: 'title', label: 'Title' },
    { field: 'description', label: 'Description' },
    { field: 'target_date', label: 'Target Date', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
    { field: 'status', label: 'Status' },
    { field: 'progress', label: 'Progress', render: (val) => `${val}%` },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (!user) {
    return <div className="text-center mt-5">Please log in to manage your goals.</div>;
  }

if (loading) {
    return (
      <Container fluid className="px-3 px-sm-4 py-4">
        <Row>
          {[...Array(4)].map((_, i) => (
            <Col md={6} lg={3} key={i} className="mb-3">
              <LoadingSkeleton type="card" lines={4} />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (error) {
    return <ErrorState title="Error loading goals" description={error} onRetry={fetchGoals} />;
  }

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Goals</h2>
        <Button variant="primary" onClick={openCreate}>+ New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No goals yet"
          description="Start by creating your first wellness goal."
          actionText="Create Goal"
          onAction={openCreate}
        />
      ) : (
        <DataTable
          columns={columns}
          data={goals}
          keyField="id"
          onRowClick={(row) => openEdit(row)}
        />
      )}

      {/* Modal for create/edit */}
      <Modal show={showModalGoal} onHide={() => setShowModalGoal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingGoal ? 'Edit Goal' : 'New Goal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <DatePicker
              label="Target Date"
              name="target_date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'archived', label: 'Archived' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Input
              label="Progress (0-100)"
              name="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalGoal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Goals;
