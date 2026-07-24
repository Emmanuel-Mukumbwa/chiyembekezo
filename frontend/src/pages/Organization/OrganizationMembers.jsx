import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const OrganizationMembers = () => {
  const { showModal } = useModal();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', firstName: '', lastName: '', role: 'org_member' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organization/members');
      setMembers(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/organization/members', newMember);
      showModal('Success', res.data.message || 'Member added.');
      setShowAddModal(false);
      setNewMember({ email: '', firstName: '', lastName: '', role: 'org_member' });
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/organization/members/${id}`, { is_active: !current });
      fetchMembers();
    } catch (err) {
      showModal('Error', 'Failed to update member.');
    }
  };

  const removeMember = async (id) => {
    try {
      await api.delete(`/organization/members/${id}`);
      fetchMembers();
    } catch (err) {
      showModal('Error', 'Failed to remove member.');
    }
  };

  // --- Confirmation handlers using ModalContext ---
  const handleToggleConfirm = (id, current) => {
    const action = current ? 'disable' : 'enable';
    showModal(
      'Confirm Action',
      `Are you sure you want to ${action} this member?`,
      () => toggleActive(id, current) // onConfirm callback
    );
  };

  const handleRemoveConfirm = (id) => {
    showModal(
      'Confirm Removal',
      'Are you sure you want to remove this member from the organization?',
      () => removeMember(id) // onConfirm callback
    );
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Organization Members</h4>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add Member</Button>
      </div>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No members found.</td></tr>
          ) : (
            members.map(m => (
              <tr key={m.id}>
                <td>{m.first_name} {m.last_name}</td>
                <td>{m.email}</td>
                <td><Badge bg="secondary">{m.role || 'member'}</Badge></td>
                <td>
                  <Badge bg={m.is_active ? 'success' : 'secondary'}>
                    {m.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant={m.is_active ? 'outline-warning' : 'outline-success'}
                    size="sm"
                    onClick={() => handleToggleConfirm(m.id, m.is_active)}
                  >
                    {m.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-1"
                    onClick={() => handleRemoveConfirm(m.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Add Member Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddMember}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                required
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              >
                <option value="org_member">Member</option>
                <option value="org_admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <small className="text-muted">If the user does not exist, they will be created with a temporary password (logged in console).</small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default OrganizationMembers;