import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminVolunteers = () => {
  const { showModal } = useModal();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

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
    setActionLoading(id);
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { is_verified: !currentStatus });
      showModal('Success', 'Volunteer updated.');
      fetchVolunteers();
    } catch (err) {
      showModal('Error', 'Failed to update volunteer.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteVolunteer = async (id) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this volunteer? This action cannot be undone.',
      async () => {
        setActionLoading(id);
        try {
          await api.delete(`/admin/volunteers/${id}`);
          showModal('Success', 'Volunteer deleted.');
          fetchVolunteers();
        } catch (err) {
          showModal('Error', 'Failed to delete volunteer.');
        } finally {
          setActionLoading(null);
        }
      }
    );
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
      render: (_, row) => {
        const isProcessing = actionLoading === row.id;
        return (
          <div className="d-flex gap-1">
            <Button
              variant={row.is_verified ? 'warning' : 'success'}
              size="sm"
              onClick={() => toggleVerify(row.id, row.is_verified)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : (row.is_verified ? 'Unverify' : 'Verify')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteVolunteer(row.id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : 'Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Volunteer Listeners</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading volunteers" description={error} onRetry={fetchVolunteers} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Volunteer Listeners</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <DataTable columns={columns} data={volunteers} keyField="id" />
    </Container>
  );
};

export default AdminVolunteers;
