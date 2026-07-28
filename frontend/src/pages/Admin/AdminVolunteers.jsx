import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState } from '../../components/ui';

const AdminVolunteers = () => {
  const { showModal } = useModal();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/volunteers');
      setVolunteers(res.data);
    } catch (err) {
      setError('Failed to load volunteers.');
      showModal('Error', 'Failed to load volunteers.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, currentStatus) => {
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { is_verified: !currentStatus });
      showModal('Success', 'Volunteer updated.');
      fetchVolunteers();
    } catch (err) {
      showModal('Error', 'Failed to update volunteer.');
    }
  };

  const deleteVolunteer = async (id) => {
    if (!window.confirm('Delete this volunteer?')) return;
    try {
      await api.delete(`/admin/volunteers/${id}`);
      showModal('Success', 'Volunteer deleted.');
      fetchVolunteers();
    } catch (err) {
      showModal('Error', 'Failed to delete volunteer.');
    }
  };

  const columns = [
    { field: 'first_name', label: 'Name', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'available_languages', label: 'Languages', render: (val) => Array.isArray(val) ? val.join(', ') : 'N/A' },
    {
      field: 'is_verified',
      label: 'Verified',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Verified' : 'Pending'}</Badge>,
    },
    {
      field: 'is_online',
      label: 'Online',
      render: (val) => <Badge bg={val ? 'success' : 'light'} text={val ? 'white' : 'dark'}>{val ? 'Online' : 'Offline'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button
            variant={row.is_verified ? 'warning' : 'success'}
            size="sm"
            onClick={() => toggleVerify(row.id, row.is_verified)}
          >
            {row.is_verified ? 'Unverify' : 'Verify'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteVolunteer(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading volunteers" description={error} onRetry={fetchVolunteers} />;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Volunteer Listeners</h4>
      <DataTable columns={columns} data={volunteers} keyField="id" />
    </Container>
  );
};

export default AdminVolunteers;
