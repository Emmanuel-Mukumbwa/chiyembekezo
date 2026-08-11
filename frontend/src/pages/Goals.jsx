import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Form, Card as BsCard, Badge, Collapse } from 'react-bootstrap';
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
  LoadingSkeleton,
} from '../components/ui';
import api from '../services/api';
import { FiFilter, FiX } from 'react-icons/fi';

const GoalCard = ({ goal, onEdit, onDelete, onToggleComplete }) => (
  <BsCard className="mb-3 shadow-sm">
    <BsCard.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{goal.title}</h6>
          <small className="text-muted">{goal.description}</small>
        </div>
        <Badge bg={goal.status === 'completed' ? 'success' : goal.status === 'archived' ? 'secondary' : 'info'}>
          {goal.status}
        </Badge>
      </div>
      <div className="d-flex justify-content-between mt-2">
        <small className="text-muted">Target: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : '-'}</small>
        <small className="text-muted">{goal.progress}%</small>
      </div>
      <div className="d-flex gap-1 mt-3">
        {goal.status !== 'completed' && goal.status !== 'archived' && (
          <Button variant="outline-success" size="sm" onClick={() => onToggleComplete(goal.id)}>
            ✓ Mark Complete
          </Button>
        )}
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(goal)}>Edit</Button>
        <Button variant="outline-danger" size="sm" onClick={() => onDelete(goal.id)}>Delete</Button>
      </div>
    </BsCard.Body>
  </BsCard>
);

const Goals = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalGoal, setShowModalGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', target_date: '', status: 'active', progress: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => { if (user) fetchGoals(); }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      setError('Failed to load goals.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal =>
    goal.title.toLowerCase().includes(appliedSearch.toLowerCase()) ||
    (goal.description || '').toLowerCase().includes(appliedSearch.toLowerCase())
  );

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const handleToggleComplete = async (id) => {
    try {
      await api.put(`/goals/${id}`, { status: 'completed' });
      showModal('Success', 'Goal marked as completed!');
      fetchGoals();
    } catch (err) {
      showModal('Error', 'Failed to complete goal.');
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
    { field: 'status', label: 'Status', render: (val) => <Badge bg={val === 'completed' ? 'success' : val === 'archived' ? 'secondary' : 'info'}>{val}</Badge> },
    { field: 'progress', label: 'Progress', render: (val) => `${val}%` },
    {
      field: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          {row.status !== 'completed' && row.status !== 'archived' && (
            <Button variant="outline-success" size="sm" onClick={() => handleToggleComplete(row.id)}>
              ✓ Accomplish
            </Button>
          )}
          <Button variant="outline-primary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (!user) return <div className="text-center mt-5">Please log in to manage your goals.</div>;

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

  if (error) return <ErrorState title="Error loading goals" description={error} onRetry={fetchGoals} />;

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Goals</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="primary" onClick={openCreate}>+ New Goal</Button>
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <Input
                label="Search Goals"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

      {filteredGoals.length === 0 && !appliedSearch && goals.length === 0 ? (
        <EmptyState icon="🎯" title="No goals yet" description="Start by creating your first wellness goal." actionText="Create Goal" onAction={openCreate} />
      ) : filteredGoals.length === 0 && appliedSearch ? (
        <p className="text-muted text-center">No goals match your search.</p>
      ) : (
        <>
          <div className="d-none d-md-block">
            <DataTable columns={columns} data={filteredGoals} keyField="id" onRowClick={(row) => openEdit(row)} />
          </div>
          <div className="d-md-none">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        </>
      )}

      <Modal show={showModalGoal} onHide={() => setShowModalGoal(false)}>
        <Modal.Header closeButton><Modal.Title>{editingGoal ? 'Edit Goal' : 'New Goal'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <DatePicker label="Target Date" name="target_date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} />
            <Select label="Status" name="status" value={formData.status} options={[
              { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'archived', label: 'Archived' }
            ]} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
            <Input label="Progress (0-100)" name="progress" type="number" min="0" max="100" value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalGoal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Goals;
