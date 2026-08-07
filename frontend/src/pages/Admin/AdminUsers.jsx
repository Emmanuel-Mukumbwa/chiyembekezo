import React, { useEffect, useState } from 'react';
import { Container, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, DataTable, ErrorState } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminUsers = () => {
  const { showModal } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to load users.');
      showModal('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, field, value) => {
    try {
      await api.put(`/admin/users/${id}`, { [field]: value });
      showModal('Success', 'User updated.');
      fetchUsers();
    } catch (err) {
      showModal('Error', 'Failed to update user.');
    }
  };

  const deleteUser = async (id) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this user? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/admin/users/${id}`);
          showModal('Success', 'User deleted.');
          fetchUsers();
        } catch (err) {
          showModal('Error', 'Failed to delete user.');
        }
      }
    );
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'email', label: 'Email' },
    { field: 'first_name', label: 'Name', render: (val, row) => `${row.first_name || ''} ${row.last_name || ''}` },
    {
      field: 'is_admin',
      label: 'Admin',
      render: (val, row) => (
        <Form.Check
          type="checkbox"
          checked={row.is_admin}
          onChange={(e) => updateStatus(row.id, 'is_admin', e.target.checked)}
        />
      ),
    },
    {
      field: 'is_professional',
      label: 'Professional',
      render: (val, row) => (
        <Form.Check
          type="checkbox"
          checked={row.is_professional}
          onChange={(e) => updateStatus(row.id, 'is_professional', e.target.checked)}
        />
      ),
    },
    {
      field: 'is_active',
      label: 'Active',
      render: (val, row) => (
        <Form.Check
          type="checkbox"
          checked={row.is_active}
          onChange={(e) => updateStatus(row.id, 'is_active', e.target.checked)}
        />
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="danger" size="sm" onClick={() => deleteUser(row.id)}>Delete</Button>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading users" description={error} onRetry={fetchUsers} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Users</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <Input
          label="Search Users"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
        />
      </div>
      <DataTable columns={columns} data={users} keyField="id" />
    </Container>
  );
};

export default AdminUsers;
