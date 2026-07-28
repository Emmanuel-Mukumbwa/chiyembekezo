import React, { useState, useEffect } from 'react';
import { Container, Modal, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  Input,
  Select,
  DataTable,
  EmptyState,
  ErrorState,
} from '../../components/ui';

const AdminOrganizations = () => {
  const { showModal } = useModal();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '', type: 'ngo', contact_email: '', contact_phone: '', domain: ''
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/organizations');
      setOrgs(res.data);
    } catch (err) {
      setError('Failed to load organizations.');
      showModal('Error', 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/organizations', newOrg);
      setShowCreate(false);
      setNewOrg({ name: '', type: 'ngo', contact_email: '', contact_phone: '', domain: '' });
      showModal('Success', 'Organization created.');
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to create organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/organizations/${selectedOrg}/members`, { email: memberEmail });
      setShowAddMember(false);
      setMemberEmail('');
      showModal('Success', 'Member added.');
      fetchOrgs();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (orgId, userId) => {
    try {
      await api.delete(`/admin/organizations/${orgId}/members/${userId}`);
      showModal('Success', 'Member removed.');
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to remove member.');
    }
  };

  const columns = [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type', render: (val) => <Badge bg="info">{val}</Badge> },
    { field: 'contact_email', label: 'Contact', render: (val, row) => (
        <div className="small">{row.contact_email || 'N/A'}<br/>{row.contact_phone || 'N/A'}</div>
      ) },
    { field: 'domain', label: 'Domain', render: (val) => val || '-' },
    { field: 'member_count', label: 'Members' },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="outline-primary" size="sm" onClick={() => { setSelectedOrg(row.id); setShowAddMember(true); }}>
          Add Member
        </Button>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading organizations" description={error} onRetry={fetchOrgs} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Organizations</h4>
        <Button variant="primary" onClick={() => setShowCreate(true)}>+ New Organization</Button>
      </div>

      {orgs.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations" description="Create your first organization." />
      ) : (
        <DataTable columns={columns} data={orgs} keyField="id" />
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>Create Organization</Modal.Title></Modal.Header>
        <form onSubmit={handleCreate}>
          <Modal.Body>
            <Input
              label="Name *"
              name="name"
              value={newOrg.name}
              onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
              required
            />
            <Select
              label="Type"
              name="type"
              value={newOrg.type}
              options={[
                { value: 'ngo', label: 'NGO' },
                { value: 'school', label: 'School' },
                { value: 'university', label: 'University' },
                { value: 'company', label: 'Company' },
                { value: 'hospital', label: 'Hospital' },
              ]}
              onChange={(e) => setNewOrg({...newOrg, type: e.target.value})}
            />
            <Input
              label="Contact Email"
              name="contact_email"
              type="email"
              value={newOrg.contact_email}
              onChange={(e) => setNewOrg({...newOrg, contact_email: e.target.value})}
            />
            <Input
              label="Contact Phone"
              name="contact_phone"
              value={newOrg.contact_phone}
              onChange={(e) => setNewOrg({...newOrg, contact_phone: e.target.value})}
            />
            <Input
              label="Domain (optional)"
              name="domain"
              value={newOrg.domain}
              onChange={(e) => setNewOrg({...newOrg, domain: e.target.value})}
              placeholder="example.com"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal show={showAddMember} onHide={() => setShowAddMember(false)}>
        <Modal.Header closeButton><Modal.Title>Add Member</Modal.Title></Modal.Header>
        <Modal.Body>
          <Input
            label="User Email"
            name="email"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddMember} disabled={submitting}>
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrganizations;
