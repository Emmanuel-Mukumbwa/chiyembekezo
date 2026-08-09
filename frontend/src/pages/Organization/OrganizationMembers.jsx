import React, { useState, useEffect } from 'react';
import { Container, Modal, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  Input,
  Select,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/ui';

const OrganizationMembers = () => {
  const { showModal } = useModal();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', firstName: '', lastName: '', role: 'org_member' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/organization/members');
      setMembers(res.data);
    } catch (err) {
      setError('Failed to load members.');
      showModal('Error', 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/organization/members', newMember);
      showModal('Success', res.data.message || 'Member added.');
      setShowAddModal(false);
      setNewMember({ email: '', firstName: '', lastName: '', role: 'org_member' });
      fetchMembers();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/organization/members/${id}`, { is_active: !current });
      fetchMembers();
      showModal('Success', 'Member updated.');
    } catch (err) {
      showModal('Error', 'Failed to update member.');
    }
  };

  const removeMember = async (id) => {
    try {
      await api.delete(`/organization/members/${id}`);
      fetchMembers();
      showModal('Success', 'Member removed.');
    } catch (err) {
      showModal('Error', 'Failed to remove member.');
    }
  };

  const handleToggleConfirm = (id, current) => {
    const action = current ? 'disable' : 'enable';
    showModal(
      'Confirm Action',
      `Are you sure you want to ${action} this member?`,
      () => toggleActive(id, current)
    );
  };

  const handleRemoveConfirm = (id) => {
    showModal(
      'Confirm Removal',
      'Are you sure you want to remove this member from the organization?',
      () => removeMember(id)
    );
  };

  const columns = [
    { field: 'first_name', label: 'Name', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'role', label: 'Role', render: (val) => <Badge bg="secondary">{val || 'member'}</Badge> },
    {
      field: 'is_active',
      label: 'Status',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Active' : 'Inactive'}</Badge>,
    },
    { field: 'created_at', label: 'Joined', render: (val) => new Date(val).toLocaleDateString() },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button
            variant={row.is_active ? 'outline-warning' : 'outline-success'}
            size="sm"
            onClick={() => handleToggleConfirm(row.id, row.is_active)}
          >
            {row.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleRemoveConfirm(row.id)}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Organization Members</h4>
        <Button variant="primary">+ Add Member</Button>
      </div>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading members" description={error} onRetry={fetchMembers} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Organization Members</h4>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add Member</Button>
      </div>

      {members.length === 0 ? (
        <EmptyState icon="👥" title="No members" description="Add your first member to get started." />
      ) : (
        <DataTable columns={columns} data={members} keyField="id" />
      )}

      {/* Add Member Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Member</Modal.Title></Modal.Header>
        <form onSubmit={handleAddMember}>
          <Modal.Body>
            <Input
              label="Email *"
              name="email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              required
            />
            <Input
              label="First Name"
              name="firstName"
              value={newMember.firstName}
              onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={newMember.lastName}
              onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
            />
            <Select
              label="Role"
              name="role"
              value={newMember.role}
              options={[
                { value: 'org_member', label: 'Member' },
                { value: 'org_admin', label: 'Admin' },
              ]}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            />
            <small className="text-muted">If the user does not exist, they will be created with a temporary password (logged in console).</small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
};

export default OrganizationMembers;
