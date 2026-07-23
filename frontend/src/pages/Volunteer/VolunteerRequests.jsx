import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const VolunteerRequests = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/peer-support/volunteer/requests');
      setRequests(res.data);
    } catch (err) {
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

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Support Requests</h2>
        <Button as={Link} to="/volunteer/dashboard" variant="outline-secondary">
          ← Back to Dashboard
        </Button>
      </div>
      <Card className="feature-card p-3">
        {requests.length === 0 ? (
          <p className="text-muted">No requests assigned to you yet.</p>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>{req.first_name} {req.last_name}</td>
                  <td>{req.message}</td>
                  <td>
                    <Badge bg={
                      req.status === 'pending' ? 'warning' :
                      req.status === 'accepted' ? 'info' :
                      req.status === 'completed' ? 'success' : 'secondary'
                    }>
                      {req.status}
                    </Badge>
                  </td>
                  <td>
                    {req.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateStatus(req.id, 'accepted')}
                      >
                        Accept
                      </Button>
                    )}
                    {req.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(req.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
};

export default VolunteerRequests;