import React, { useEffect, useState } from 'react';
import { Container, Form, Row, Col, Card, Badge, Modal, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, DataTable, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const AdminUserCard = ({ user, onManage }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{user.first_name} {user.last_name}</h6>
          <small className="text-muted">{user.email}</small><br />
          <small className="text-muted">ID: {user.id}</small>
        </div>
        <Badge bg={user.is_active ? 'success' : 'secondary'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>
      <hr />
      <div className="d-flex flex-wrap gap-2 mb-2">
        {user.is_admin && <Badge bg="primary">Admin</Badge>}
        {user.is_professional && <Badge bg="info">Professional</Badge>}
      </div>
      <Button variant="outline-primary" size="sm" onClick={() => onManage(user)}>Manage</Button>
    </Card.Body>
  </Card>
);

const AdminUsers = () => {
  const { showModal } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [manageUser, setManageUser] = useState(null);
  const [manageForm, setManageForm] = useState({ is_admin: false, is_professional: false, is_active: true });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/users?search=${appliedSearch}`);
      setUsers(res.data.users || []);
    } catch {
      setError('Failed to load users.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [appliedSearch]);

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const openManage = (user) => {
    setManageUser(user);
    setManageForm({ is_admin: user.is_admin, is_professional: user.is_professional, is_active: user.is_active });
  };

  const handleManageSave = async () => {
    if (!manageUser) return;
    try {
      await api.put(`/admin/users/${manageUser.id}`, manageForm);
      showModal('Success', 'User updated.');
      setManageUser(null);
      fetchUsers();
    } catch { showModal('Error', 'Failed to update user.'); }
  };

  const deleteUser = async (id) => {
    showModal('Confirm Delete', 'Are you sure? This cannot be undone.', async () => {
      try {
        await api.delete(`/admin/users/${id}`);
        showModal('Success', 'User deleted.');
        fetchUsers();
      } catch { showModal('Error', 'Failed to delete user.'); }
    });
  };

  const columns = [
    { field: 'user', label: 'User', render: (_, row) => (
        <div>
          <div className="fw-semibold">{row.first_name} {row.last_name}</div>
          <small className="text-muted">{row.email}</small><br />
          <small className="text-muted">ID: {row.id}</small>
        </div>
      ) },
    { field: 'roles', label: 'Roles', render: (_, row) => (
        <div className="d-flex flex-wrap gap-1">
          {row.is_admin && <Badge bg="primary">Admin</Badge>}
          {row.is_professional && <Badge bg="info">Professional</Badge>}
          {!row.is_admin && !row.is_professional && <Badge bg="secondary">User</Badge>}
        </div>
      ) },
    { field: 'status', label: 'Status', render: (_, row) => <Badge bg={row.is_active ? 'success' : 'secondary'}>{row.is_active ? 'Active' : 'Inactive'}</Badge> },
    { field: 'actions', label: '', render: (_, row) => <Button variant="outline-primary" size="sm" onClick={() => openManage(row)}>Manage</Button> },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Users</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );

  if (error) return <ErrorState title="Error loading users" description={error} onRetry={fetchUsers} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Users</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <Input label="Search Users" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..." onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }} />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

      <div className="d-none d-md-block"><DataTable columns={columns} data={users} keyField="id" /></div>
      <div className="d-md-none">
        {users.length === 0 ? <p className="text-center text-muted">No users found.</p> : users.map(user => <AdminUserCard key={user.id} user={user} onManage={openManage} />)}
      </div>

      <Modal show={!!manageUser} onHide={() => setManageUser(null)} centered>
        <Modal.Header closeButton><Modal.Title>Manage User</Modal.Title></Modal.Header>
        <Modal.Body>
          {manageUser && (
            <>
              <h6>{manageUser.first_name} {manageUser.last_name}</h6>
              <p className="text-muted small">{manageUser.email}</p>
              <hr />
              <Form.Check type="switch" id="admin-switch" label="Administrator" checked={manageForm.is_admin}
                onChange={(e) => setManageForm(prev => ({ ...prev, is_admin: e.target.checked }))} className="mb-2" />
              <Form.Check type="switch" id="pro-switch" label="Professional" checked={manageForm.is_professional}
                onChange={(e) => setManageForm(prev => ({ ...prev, is_professional: e.target.checked }))} className="mb-2" />
              <Form.Check type="switch" id="active-switch" label="Active Account" checked={manageForm.is_active}
                onChange={(e) => setManageForm(prev => ({ ...prev, is_active: e.target.checked }))} className="mb-3" />
              <hr />
              <Button variant="danger" className="w-100" onClick={() => { setManageUser(null); deleteUser(manageUser.id); }}>Delete User</Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setManageUser(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleManageSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsers;
