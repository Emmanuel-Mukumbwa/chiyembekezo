import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  DataTable,
  Input,
  Select,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminSounds = () => {
  const { showModal } = useModal();
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalItem, setShowModalItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    color: '',
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
      const res = await api.get('/admin/wellness/sounds');
      setSounds(res.data);
    } catch (err) {
      setError('Failed to load sounds.');
      showModal('Error', 'Failed to load sounds.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/admin/wellness/sounds/${editingItem.id}`, formData);
        showModal('Success', 'Sound updated.');
      } else {
        await api.post('/admin/wellness/sounds', formData);
        showModal('Success', 'Sound created.');
      }
      setShowModalItem(false);
      setEditingItem(null);
      setFormData({ name: '', icon: '', color: '', sort_order: 0, is_active: true });
      fetchData();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure you want to delete this sound?', async () => {
      try {
        await api.delete(`/admin/wellness/sounds/${id}`);
        showModal('Success', 'Sound deleted.');
        fetchData();
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      icon: item.icon || '',
      color: item.color || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1,
    });
    setShowModalItem(true);
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'icon', label: 'Icon', render: (val) => <span style={{ fontSize: '1.5rem' }}>{val}</span> },
    { field: 'color', label: 'Color', render: (val) => <div style={{ width: '20px', height: '20px', backgroundColor: val, borderRadius: '4px' }} /> },
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

  if (error) return <ErrorState title="Error loading sounds" description={error} onRetry={fetchData} />;

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Relaxation Sounds</h4>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => { setEditingItem(null); setFormData({ name: '', icon: '', color: '', sort_order: 0, is_active: true }); setShowModalItem(true); }}>+ New Sound</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      {sounds.length === 0 ? (
        <EmptyState icon="🌧" title="No sounds" description="Create your first relaxation sound." />
      ) : (
        <DataTable columns={columns} data={sounds} keyField="id" />
      )}

      {/* Modal */}
      <Modal show={showModalItem} onHide={() => setShowModalItem(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Edit Sound' : 'New Sound'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input label="Name *" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Icon (emoji)" name="icon" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g., 🌧" />
            <Input label="Color (hex)" name="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#4a90d9" />
            <Input label="Sort Order" name="sort_order" type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
            <Form.Group>
              <Form.Check
                type="checkbox"
                label="Active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
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

export default AdminSounds;
