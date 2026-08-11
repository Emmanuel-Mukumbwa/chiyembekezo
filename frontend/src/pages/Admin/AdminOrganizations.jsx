import React, { useState, useEffect } from 'react';
import { Container, Modal, Badge, Row, Col, ListGroup, Card } from 'react-bootstrap';
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
import LogoutButton from '../../components/LogoutButton';

const OrgCard = ({ org, onEdit, onToggleActive, onOpenMembers }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{org.name}</h6>
          <small className="text-muted">{org.type} · {org.contact_email || 'No email'}</small>
        </div>
        <Badge bg={org.is_active ? 'success' : 'danger'}>{org.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="mt-2">
        <small className="text-muted">👥 {org.member_count} members</small>
      </div>
      <div className="d-flex gap-1 mt-2 flex-wrap">
        <Button variant="outline-secondary" size="sm" onClick={() => onOpenMembers(org)}>👥 Members</Button>
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(org)}>✏️ Edit</Button>
        <Button
          variant={org.is_active ? 'outline-danger' : 'outline-success'}
          size="sm"
          onClick={() => onToggleActive(org.id)}
        >
          {org.is_active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    </Card.Body>
  </Card>
);

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

  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editOrg, setEditOrg] = useState({ id: '', name: '', type: '', contact_email: '', contact_phone: '', domain: '' });

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

  const fetchMembers = async (orgId) => {
    setMembersLoading(true);
    try {
      const res = await api.get(`/admin/organizations/${orgId}/members`);
      setMembers(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load members.');
    } finally {
      setMembersLoading(false);
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

  const handleEdit = (org) => {
    setEditOrg({
      id: org.id,
      name: org.name,
      type: org.type,
      contact_email: org.contact_email || '',
      contact_phone: org.contact_phone || '',
      domain: org.domain || '',
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/admin/organizations/${editOrg.id}`, editOrg);
      setShowEdit(false);
      showModal('Success', 'Organization updated.');
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to update organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (orgId) => {
    try {
      await api.put(`/admin/organizations/${orgId}/toggle-active`);
      fetchOrgs();
    } catch (err) {
      showModal('Error', 'Failed to toggle status.');
    }
  };

  const openMembers = (org) => {
    setSelectedOrg(org);
    setShowMembers(true);
    fetchMembers(org.id);
  };

  const handleAddMember = async () => {
    if (!selectedOrg) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/organizations/${selectedOrg}/members`, { email: memberEmail });
      setShowAddMember(false);
      setMemberEmail('');
      showModal('Success', 'Member added.');
      fetchMembers(selectedOrg);
      fetchOrgs();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (userId) => {
    if (!selectedOrg) return;
    showModal(
      'Confirm Remove',
      'Are you sure you want to remove this member?',
      async () => {
        try {
          await api.delete(`/admin/organizations/${selectedOrg}/members/${userId}`);
          showModal('Success', 'Member removed.');
          fetchMembers(selectedOrg);
          fetchOrgs();
        } catch (err) {
          showModal('Error', 'Failed to remove member.');
        }
      }
    );
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
      field: 'is_active',
      label: 'Active',
      render: (val) => <Badge bg={val ? 'success' : 'danger'}>{val ? 'Yes' : 'No'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1 flex-wrap">
          <Button variant="outline-secondary" size="sm" onClick={() => openMembers(row)}>
            👥
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(row)}>
            ✏️
          </Button>
          <Button
            variant={row.is_active ? 'outline-danger' : 'outline-success'}
            size="sm"
            onClick={() => toggleActive(row.id)}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Organizations</h4>
        <div className="d-flex gap-2">
          <Button variant="primary">+ New Organization</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );

  if (error) return <ErrorState title="Error loading organizations" description={error} onRetry={fetchOrgs} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Organizations</h4>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => setShowCreate(true)}>+ New Organization</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      {orgs.length === 0 ? (
        <EmptyState icon="🏢" title="No organizations" description="Create your first organization." />
      ) : (
        <>
          <div className="d-none d-md-block">
            <DataTable columns={columns} data={orgs} keyField="id" />
          </div>
          <div className="d-md-none">
            {orgs.map(org => (
              <OrgCard key={org.id} org={org} onEdit={handleEdit} onToggleActive={toggleActive} onOpenMembers={openMembers} />
            ))}
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Modal.Header closeButton><Modal.Title>Create Organization</Modal.Title></Modal.Header>
        <form onSubmit={handleCreate}>
          <Modal.Body>
            <Input label="Name *" name="name" value={newOrg.name} onChange={(e) => setNewOrg({...newOrg, name: e.target.value})} required placeholder="e.g., Youth Mental Health Malawi" />
            <Select label="Type" name="type" value={newOrg.type} options={[
              { value: 'ngo', label: 'NGO' }, { value: 'school', label: 'School' }, { value: 'university', label: 'University' }, { value: 'company', label: 'Company' }, { value: 'hospital', label: 'Hospital' },
            ]} onChange={(e) => setNewOrg({...newOrg, type: e.target.value})} />
            <Input label="Contact Email" name="contact_email" type="email" value={newOrg.contact_email} onChange={(e) => setNewOrg({...newOrg, contact_email: e.target.value})} placeholder="info@organization.mw" />
            <Input label="Contact Phone" name="contact_phone" value={newOrg.contact_phone} onChange={(e) => setNewOrg({...newOrg, contact_phone: e.target.value})} placeholder="+265 999 123 456" />
            <Input label="Domain (optional)" name="domain" value={newOrg.domain} onChange={(e) => setNewOrg({...newOrg, domain: e.target.value})} placeholder="example.com" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Organization</Modal.Title></Modal.Header>
        <form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Input label="Name" name="name" value={editOrg.name} onChange={(e) => setEditOrg({...editOrg, name: e.target.value})} required />
            <Select label="Type" name="type" value={editOrg.type} options={[
              { value: 'ngo', label: 'NGO' }, { value: 'school', label: 'School' }, { value: 'university', label: 'University' }, { value: 'company', label: 'Company' }, { value: 'hospital', label: 'Hospital' },
            ]} onChange={(e) => setEditOrg({...editOrg, type: e.target.value})} />
            <Input label="Contact Email" name="contact_email" type="email" value={editOrg.contact_email} onChange={(e) => setEditOrg({...editOrg, contact_email: e.target.value})} />
            <Input label="Contact Phone" name="contact_phone" value={editOrg.contact_phone} onChange={(e) => setEditOrg({...editOrg, contact_phone: e.target.value})} />
            <Input label="Domain" name="domain" value={editOrg.domain} onChange={(e) => setEditOrg({...editOrg, domain: e.target.value})} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal show={showMembers} onHide={() => setShowMembers(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Members of {selectedOrg?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {membersLoading ? (
            <div className="text-center"><LoadingSkeleton type="list" lines={3} /></div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>{members.length} member(s)</span>
                <Button variant="primary" size="sm" onClick={() => { setShowAddMember(true); setShowMembers(false); }}>
                  + Add Member
                </Button>
              </div>
              {members.length === 0 ? (
                <EmptyState icon="👥" title="No members" description="Add the first member." />
              ) : (
                <ListGroup>
                  {members.map(m => (
                    <ListGroup.Item key={m.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{m.first_name} {m.last_name}</strong> <span className="text-muted">({m.email})</span>
                        <Badge bg="light" text="dark" className="ms-2">{m.role}</Badge>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => removeMember(m.id)}>
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </Modal.Body>
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
