import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const VolunteerAvailable = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailable();
  }, []);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/peer-support/available');
      setRequests(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load available requests.');
    } finally {
      setLoading(false);
    }
  };

  const claimRequest = async (id) => {
    if (!window.confirm('Claim this request?')) return;
    try {
      await api.post(`/peer-support/requests/${id}/claim`);
      showModal('Success', 'Request claimed.');
      fetchAvailable();
    } catch (err) {
      showModal('Error', 'Failed to claim request.');
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
      <h2>Available Requests</h2>
      <p className="text-muted">Find a request to support</p>
      <Card className="feature-card p-3">
        {requests.length === 0 ? (
          <p className="text-muted">No available requests.</p>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>User</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{req.first_name} {req.last_name}</td>
                  <td>{req.message}</td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => claimRequest(req.id)}>
                      Claim
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <div className="mt-3">
        <Button as={Link} to="/volunteer/dashboard" variant="outline-secondary">← Back</Button>
      </div>
    </Container>
  );
};

export default VolunteerAvailable;