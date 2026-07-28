import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  Button,
  Card,
  Input,
  Select,
  DataTable,
  EmptyState,
  ErrorState,
} from '../components/ui';
import api from '../services/api';

const Habits = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [habitsRes, todayRes] = await Promise.all([
        api.get('/habits'),
        api.get('/habits/today/logs'),
      ]);
      setHabits(habitsRes.data);
      setTodayLogs(todayRes.data);
    } catch (err) {
      setError('Failed to load habits.');
      console.error(err);
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
    try {
      await api.delete(`/habits/${id}`);
      fetchData();
      showModal('Success', 'Habit deleted.');
    } catch (err) {
      showModal('Error', 'Failed to delete.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit.id}`, formData);
        showModal('Success', 'Habit updated!');
      } else {
        await api.post('/habits', formData);
        showModal('Success', 'Habit created!');
      }
      setShowModalHabit(false);
      setEditingHabit(null);
      setFormData({ name: '', category: 'general', target_value: 1, unit: 'times', frequency: 'daily', goal_id: null });
      fetchData();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to save habit.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      category: habit.category || 'general',
      target_value: habit.target_value || 1,
      unit: habit.unit || 'times',
      frequency: habit.frequency || 'daily',
      goal_id: habit.goal_id || null,
    });
    setShowModalHabit(true);
  };

  const columns = [
    { field: 'name', label: 'Name' },
    { field: 'category', label: 'Category' },
    { field: 'target_value', label: 'Target', render: (val, row) => `${val} ${row.unit}` },
    { field: 'frequency', label: 'Frequency' },
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
    return <div className="text-center mt-5">Please log in to manage habits.</div>;
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return <ErrorState title="Error loading habits" description={error} onRetry={fetchData} />;
  }

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Habits</h2>
        <Button variant="primary" onClick={() => { setEditingHabit(null); setFormData({ name: '', category: 'general', target_value: 1, unit: 'times', frequency: 'daily', goal_id: null }); setShowModalHabit(true); }}>
          + New Habit
        </Button>
      </div>

      {/* Today's Checklist */}
      <Card className="p-3 mb-4">
        <h6>Today's Checklist</h6>
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

      {habits.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No habits yet"
          description="Start building healthy habits today."
          actionText="Create Habit"
          onAction={() => {}}
        />
      ) : (
        <DataTable columns={columns} data={habits} keyField="id" />
      )}

      {/* Modal */}
      <Modal show={showModalHabit} onHide={() => setShowModalHabit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingHabit ? 'Edit Habit' : 'New Habit'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Category"
              name="category"
              value={formData.category}
              options={[
                { value: 'general', label: 'General' },
                { value: 'exercise', label: 'Exercise' },
                { value: 'nutrition', label: 'Nutrition' },
                { value: 'mental_health', label: 'Mental Health' },
                { value: 'sleep', label: 'Sleep' },
              ]}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Row>
              <Col sm={6}>
                <Input
                  label="Target Value"
                  name="target_value"
                  type="number"
                  step="0.01"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                />
              </Col>
              <Col sm={6}>
                <Input
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </Col>
            </Row>
            <Select
              label="Frequency"
              name="frequency"
              value={formData.frequency}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ]}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalHabit(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Habits;
