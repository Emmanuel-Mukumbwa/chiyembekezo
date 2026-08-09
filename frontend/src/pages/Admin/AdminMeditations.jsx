import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  DataTable,
  Input,
  Select,
  Textarea,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminMeditations = () => {
  const { showModal } = useModal();
  const [meditations, setMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalItem, setShowModalItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    duration: '',
    description: '',
    narrator: '',
    background_sound: '',
    sort_order: 0,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/wellness/meditations');
      setMeditations(res.data);
    } catch (err) {
      setError('Failed to load meditations.');
      showModal('Error', 'Failed to load meditations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/admin/wellness/meditations/${editingItem.id}`, formData);
        showModal('Success', 'Meditation updated.');
      } else {
        await api.post('/admin/wellness/meditations', formData);
        showModal('Success', 'Meditation created.');
      }
      setShowModalItem(false);
      setEditingItem(null);
      setFormData({ title: '', category: '', duration: '', description: '', narrator: '', background_sound: '', sort_order: 0, is_active: true });
      fetchData();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure you want to delete this meditation?', async () => {
      try {
        await api.delete(`/admin/wellness/meditations/${id}`);
        showModal('Success', 'Meditation deleted.');
        fetchData();
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      duration: item.duration,
      description: item.description || '',
      narrator: item.narrator || '',
      background_sound: item.background_sound || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1,
    });
    setShowModalItem(true);
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category' },
    { field: 'duration', label: 'Duration (min)' },
    { field: 'narrator', label: 'Narrator', render: (val) => val || '-' },
    {
      field: 'is_active',
      label: 'Active',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <LoadingSkeleton type="avatar" />
        </div>
        <LoadingSkeleton type="list" lines={5} />
      </Container>
    );
  }

  if (error) return <ErrorState title="Error loading meditations" description={error} onRetry={fetchData} />;

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Meditations</h4>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => { setEditingItem(null); setFormData({ title: '', category: '', duration: '', description: '', narrator: '', background_sound: '', sort_order: 0, is_active: true }); setShowModalItem(true); }}>+ New Meditation</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      {meditations.length === 0 ? (
        <EmptyState icon="🧘" title="No meditations" description="Create your first meditation." />
      ) : (
        <DataTable columns={columns} data={meditations} keyField="id" />
      )}

      {/* Modal */}
      <Modal show={showModalItem} onHide={() => setShowModalItem(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Edit Meditation' : 'New Meditation'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Input label="Title *" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </Col>
              <Col md={6}>
                <Input label="Category *" name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Input label="Duration (minutes) *" name="duration" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} required />
              </Col>
              <Col md={4}>
                <Input label="Narrator" name="narrator" value={formData.narrator} onChange={(e) => setFormData({ ...formData, narrator: e.target.value })} />
              </Col>
              <Col md={4}>
                <Input label="Background Sound" name="background_sound" value={formData.background_sound} onChange={(e) => setFormData({ ...formData, background_sound: e.target.value })} />
              </Col>
            </Row>
            <Textarea label="Description" name="description" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Row>
              <Col md={6}>
                <Input label="Sort Order" name="sort_order" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalItem(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminMeditations;
