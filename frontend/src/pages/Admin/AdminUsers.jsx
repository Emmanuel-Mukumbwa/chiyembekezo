import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminUsers = () => {
  const { showModal } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?search=${search}`);
      setUsers(res.data.users);
    } catch (err) {
      showModal('Error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, field, value) => {
    try {
      await api.put(`/admin/users/${id}`, { [field]: value });
      fetchUsers();
    } catch (err) {
      showModal('Error', 'Failed to update user.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      showModal('Error', 'Failed to delete user.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Users</h4>
      <Form className="mb-3">
        <Form.Control
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
        />
      </Form>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Admin</th>
            <th>Professional</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={u.is_admin}
                  onChange={(e) => updateStatus(u.id, 'is_admin', e.target.checked)}
                />
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={u.is_professional}
                  onChange={(e) => updateStatus(u.id, 'is_professional', e.target.checked)}
                />
              </td>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={u.is_active}
                  onChange={(e) => updateStatus(u.id, 'is_active', e.target.checked)}
                />
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminUsers;