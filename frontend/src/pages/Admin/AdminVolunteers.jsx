import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminVolunteers = () => {
  const { showModal } = useModal();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/volunteers');
      setVolunteers(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load volunteers.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, currentStatus) => {
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { is_verified: !currentStatus });
      fetchVolunteers();
    } catch (err) {
      showModal('Error', 'Failed to update volunteer.');
    }
  };

  const deleteVolunteer = async (id) => {
    if (!window.confirm('Delete this volunteer?')) return;
    try {
      await api.delete(`/admin/volunteers/${id}`);
      fetchVolunteers();
    } catch (err) {
      showModal('Error', 'Failed to delete volunteer.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Volunteer Listeners</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Languages</th>
            <th>Verified</th>
            <th>Online</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map(v => (
            <tr key={v.id}>
              <td>{v.first_name} {v.last_name}</td>
              <td>{v.email}</td>
              <td>{v.available_languages.join(', ') || 'N/A'}</td>
              <td>
                <Badge bg={v.is_verified ? 'success' : 'secondary'}>
                  {v.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </td>
              <td>
                <Badge bg={v.is_online ? 'success' : 'light'} text={v.is_online ? 'white' : 'dark'}>
                  {v.is_online ? 'Online' : 'Offline'}
                </Badge>
              </td>
              <td>
                <Button variant={v.is_verified ? 'warning' : 'success'} size="sm" onClick={() => toggleVerify(v.id, v.is_verified)}>
                  {v.is_verified ? 'Unverify' : 'Verify'}
                </Button>
                <Button variant="danger" size="sm" className="ms-1" onClick={() => deleteVolunteer(v.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminVolunteers;