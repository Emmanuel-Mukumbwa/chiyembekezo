import React, { useState, useEffect } from 'react';
import { Container, Modal, Badge, Button, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, Input, Select, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminEmergencyContacts = () => {
  const { showModal } = useModal();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalContact, setShowModalContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    organization: '',
    district: '',
    contact_type: 'helpline',
    is_active: true,
    is_featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/emergency-contacts');
      setContacts(res.data);
    } catch (err) {
      setError('Failed to load emergency contacts.');
      showModal('Error', 'Failed to load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingContact) {
        await api.put(`/admin/emergency-contacts/${editingContact.id}`, formData);
        showModal('Success', 'Contact updated.');
      } else {
        await api.post('/admin/emergency-contacts', formData);
        showModal('Success', 'Contact created.');
      }
      setShowModalContact(false);
      setEditingContact(null);
      setFormData({ name: '', phone: '', organization: '', district: '', contact_type: 'helpline', is_active: true, is_featured: false });
      fetchContacts();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this contact?',
      async () => {
        try {
          await api.delete(`/admin/emergency-contacts/${id}`);
          showModal('Success', 'Contact deleted.');
          fetchContacts();
        } catch (err) {
          showModal('Error', 'Failed to delete contact.');
        }
      }
    );
  };

  const openEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      organization: contact.organization || '',
      district: contact.district || '',
      contact_type: contact.contact_type,
      is_active: contact.is_active === 1,
      is_featured: contact.is_featured === 1,
    });
    setShowModalContact(true);
  };

  const columns = [
    { field: 'name', label: 'Name' },
    { field: 'phone', label: 'Phone' },
    { field: 'organization', label: 'Organization', render: (val) => val || '-' },
    { field: 'district', label: 'District', render: (val) => val || '-' },
    { field: 'contact_type', label: 'Type', render: (val) => <Badge bg="info">{val}</Badge> },
    {
      field: 'is_active',
      label: 'Active',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>,
    },
    {
      field: 'is_featured',
      label: 'Featured',
      render: (val) => <Badge bg={val ? 'warning' : 'light'}>{val ? '⭐' : ''}</Badge>,
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

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Emergency Contacts</h4>
        <div className="d-flex gap-2">
          <Button variant="primary">+ New Contact</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading contacts" description={error} onRetry={fetchContacts} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Emergency Contacts</h4>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => { setEditingContact(null); setFormData({ name: '', phone: '', organization: '', district: '', contact_type: 'helpline', is_active: true, is_featured: false }); setShowModalContact(true); }}>+ New Contact</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <DataTable columns={columns} data={contacts} keyField="id" />

      {/* Modal */}
      <Modal show={showModalContact} onHide={() => setShowModalContact(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingContact ? 'Edit Contact' : 'New Contact'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input
              label="Name *"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Lilongwe Police Station"
            />
            <Input
              label="Phone *"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="e.g., +265 999 123 456"
            />
            <Input
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="e.g., Malawi Police Service"
            />
            <Input
              label="District"
              name="district"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g., Lilongwe"
            />
            <Select
              label="Contact Type"
              name="contact_type"
              value={formData.contact_type}
              options={[
                { value: 'hospital', label: 'Hospital' },
                { value: 'police', label: 'Police' },
                { value: 'helpline', label: 'Helpline' },
                { value: 'counselor', label: 'Counselor' },
                { value: 'ngo', label: 'NGO' },
              ]}
              onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
            />
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Form.Text className="text-muted">Only active contacts appear in the emergency help pages.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="⭐ Featured (show in Quick Help Numbers)"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <Form.Text className="text-muted">Featured contacts appear prominently in the emergency quick‑help section.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalContact(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminEmergencyContacts;
