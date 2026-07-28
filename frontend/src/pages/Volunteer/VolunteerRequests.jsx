import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const VolunteerRequests = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/peer-support/volunteer/requests');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load requests.');
      showModal('Error', 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/peer-support/requests/${id}/status`, { status });
      showModal('Success', 'Request updated.');
      fetchRequests();
    } catch (err) {
      showModal('Error', 'Failed to update request.');
    }
  };

  const statusColors = {
    pending: 'warning',
    accepted: 'info',
    completed: 'success',
    cancelled: 'secondary',
  };

  const columns = [
    { field: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleString() },
    { field: 'first_name', label: 'User', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'message', label: 'Message' },
    {
      field: 'status',
      label: 'Status',
      render: (val) => <Badge bg={statusColors[val] || 'secondary'}>{val}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => {
        if (row.status === 'pending') {
          return (
            <Button variant="success" size="sm" onClick={() => updateStatus(row.id, 'accepted')}>
              Accept
            </Button>
          );
        }
        if (row.status === 'accepted') {
          return (
            <Button variant="secondary" size="sm" onClick={() => updateStatus(row.id, 'completed')}>
              Mark Complete
            </Button>
          );
        }
        return null;
      },
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading requests" description={error} onRetry={fetchRequests} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Support Requests</h4>
        <div className="d-flex gap-2">
          <Button as={Link} to="/volunteer/dashboard" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      {requests.length === 0 ? (
        <EmptyState icon="📋" title="No requests assigned" description="No requests have been assigned to you yet." />
      ) : (
        <DataTable columns={columns} data={requests} keyField="id" />
      )}
    </Container>
  );
};

export default VolunteerRequests;
