import React, { useState, useEffect, useRef } from 'react';
import { Container, Modal, Badge, Button, Form, Card, Row, Col, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, Input, Select, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const ContactCard = ({ contact, onEdit, onDelete }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{contact.name} {contact.is_featured ? '⭐' : ''}</h6>
          <small className="text-muted">{contact.phone}</small>
          <br />
          <small className="text-muted">{contact.organization || 'N/A'} · {contact.district || 'N/A'}</small>
        </div>
        <Badge bg={contact.is_active ? 'success' : 'secondary'}>{contact.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="d-flex gap-1 mt-2">
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(contact)}>Edit</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(contact.id)}>Delete</Button>
      </div>
    </Card.Body>
  </Card>
);

const AdminEmergencyContacts = () => {
  const { showModal } = useModal();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [showModalContact, setShowModalContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', organization: '', district: '', contact_type: 'helpline', is_active: true, is_featured: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/emergency-contacts?search=${appliedSearch}`);
      setContacts(res.data);
    } catch (err) {
      setError('Failed to load emergency contacts.');
      showModal('Error', 'Failed to load emergency contacts.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchContacts();
  }, [appliedSearch]);

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

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
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure?', async () => {
      try {
        await api.delete(`/admin/emergency-contacts/${id}`);
        showModal('Success', 'Contact deleted.');
        fetchContacts();
      } catch (err) {
        showModal('Error', 'Failed to delete contact.');
      }
    });
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
    { field: 'is_active', label: 'Active', render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge> },
    { field: 'is_featured', label: 'Featured', render: (val) => <Badge bg={val ? 'warning' : 'light'}>{val ? '⭐' : ''}</Badge> },
    {
      field: 'actions', label: 'Actions',
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
          {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
        </Button>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <Input label="Search" name="search" value={search}
                onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, organization..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }} />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

      <div className="d-none d-md-block"><DataTable columns={columns} data={contacts} keyField="id" /></div>
      <div className="d-md-none">
        {contacts.length === 0 ? (
          <p className="text-center text-muted">No contacts found.</p>
        ) : (
          contacts.map(contact => <ContactCard key={contact.id} contact={contact} onEdit={openEdit} onDelete={handleDelete} />)
        )}
      </div>

      <Modal show={showModalContact} onHide={() => setShowModalContact(false)}>
        <Modal.Header closeButton><Modal.Title>{editingContact ? 'Edit Contact' : 'New Contact'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input label="Name *" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Lilongwe Police Station" />
            <Input label="Phone *" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="e.g., +265 999 123 456" />
            <Input label="Organization" name="organization" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} placeholder="e.g., Malawi Police Service" />
            <Input label="District" name="district" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="e.g., Lilongwe" />
            <Select label="Contact Type" name="contact_type" value={formData.contact_type} options={[
              { value: 'hospital', label: 'Hospital' }, { value: 'police', label: 'Police' }, { value: 'helpline', label: 'Helpline' }, { value: 'counselor', label: 'Counselor' }, { value: 'ngo', label: 'NGO' },
            ]} onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })} />
            <Form.Check type="checkbox" label="Active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
            <Form.Check type="checkbox" label="⭐ Featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalContact(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminEmergencyContacts;
