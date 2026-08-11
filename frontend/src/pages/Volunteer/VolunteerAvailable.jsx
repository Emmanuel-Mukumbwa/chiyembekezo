import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AvailableCard = ({ req, onClaim }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <h6>{req.first_name} {req.last_name}</h6>
      <p>{req.message}</p>
      <small className="text-muted">{new Date(req.created_at).toLocaleString()}</small>
      <div className="mt-2">
        <Button variant="primary" size="sm" onClick={() => onClaim(req.id)}>Claim</Button>
      </div>
    </Card.Body>
  </Card>
);

const VolunteerAvailable = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchAvailable(); }, []);

  const fetchAvailable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/peer-support/available');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load available requests.');
      showModal('Error', 'Failed to load available requests.');
    } finally {
      setLoading(false);
    }
  };

  const claimRequest = async (id) => {
    try {
      await api.post(`/peer-support/requests/${id}/claim`);
      showModal('Success', 'Request claimed.');
      fetchAvailable();
    } catch (err) {
      showModal('Error', 'Failed to claim request.');
    }
  };

  const columns = [
    { field: 'first_name', label: 'User', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'message', label: 'Message' },
    { field: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleString() },
    { field: 'actions', label: 'Action', render: (_, row) => <Button variant="primary" size="sm" onClick={() => claimRequest(row.id)}>Claim</Button> },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Available Requests</h4>
        <div className="d-flex gap-2">
          <Button as={Link} to="/volunteer/dashboard" variant="outline-secondary">← Back</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading requests" description={error} onRetry={fetchAvailable} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Available Requests</h4>
        <div className="d-flex gap-2">
          <Button as={Link} to="/volunteer/dashboard" variant="outline-secondary">← Back</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <p className="text-muted">Find a request to support</p>
      {requests.length === 0 ? (
        <EmptyState icon="🤝" title="No available requests" description="All requests have been claimed." />
      ) : (
        <>
          <div className="d-none d-md-block">
            <DataTable columns={columns} data={requests} keyField="id" />
          </div>
          <div className="d-md-none">
            {requests.map(r => <AvailableCard key={r.id} req={r} onClaim={claimRequest} />)}
          </div>
        </>
      )}
    </Container>
  );
};

export default VolunteerAvailable;
