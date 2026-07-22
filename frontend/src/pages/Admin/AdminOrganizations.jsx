import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminOrganizations = () => {
  const { showModal } = useModal();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '', type: 'ngo', contact_email: '', contact_phone: '', domain: ''
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizations');
      setOrgs(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/organizations', newOrg);
      setShowCreate(false);
      setNewOrg({ name: '', type: 'ngo', contact_email: '', contact_phone: '', domain: '' });
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to create organization.');
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrg) return;
    try {
      await api.post(`/admin/organizations/${selectedOrg}/members`, { email: memberEmail });
      setShowAddMember(false);
      setMemberEmail('');
      fetchOrgs();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to add member.');
    }
  };

  const removeMember = async (orgId, userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/admin/organizations/${orgId}/members/${userId}`);
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to remove member.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Organizations</h4>
        <Button variant="primary" onClick={() => setShowCreate(true)}>+ New Organization</Button>
      </div>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Contact</th>
            <th>Domain</th>
            <th>Members</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map(org => (
            <tr key={org.id}>
              <td>{org.name}</td>
              <td><Badge bg="info">{org.type}</Badge></td>
              <td>
                <div className="small">{org.contact_email || 'N/A'}</div>
                <div className="small">{org.contact_phone || 'N/A'}</div>
              </td>
              <td>{org.domain || '-'}</td>
              <td>{org.member_count}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => { setSelectedOrg(org.id); setShowAddMember(true); }}>
                  Add Member
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>Create Organization</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control required value={newOrg.name} onChange={(e) => setNewOrg({...newOrg, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select value={newOrg.type} onChange={(e) => setNewOrg({...newOrg, type: e.target.value})}>
                <option value="ngo">NGO</option>
                <option value="school">School</option>
                <option value="university">University</option>
                <option value="company">Company</option>
                <option value="hospital">Hospital</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Email</Form.Label>
              <Form.Control type="email" value={newOrg.contact_email} onChange={(e) => setNewOrg({...newOrg, contact_email: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Phone</Form.Label>
              <Form.Control value={newOrg.contact_phone} onChange={(e) => setNewOrg({...newOrg, contact_phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Domain (optional)</Form.Label>
              <Form.Control value={newOrg.domain} onChange={(e) => setNewOrg({...newOrg, domain: e.target.value})} placeholder="example.com" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Member Modal */}
      <Modal show={showAddMember} onHide={() => setShowAddMember(false)}>
        <Modal.Header closeButton><Modal.Title>Add Member</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>User Email</Form.Label>
            <Form.Control
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddMember}>Add</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrganizations;