import React, { useEffect, useState } from 'react';
import { Container, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';
import { ErrorState, LoadingSkeleton, Button } from '../components/ui';

const MyApplications = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load your applications.');
      showModal('Error', 'Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to view your applications.</h3>
        <Button as="a" href="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) return <Container className="my-5"><LoadingSkeleton type="list" lines={4} /></Container>;
  if (error) return <Container className="my-5"><ErrorState title="Error" description={error} onRetry={fetchApplications} /></Container>;

  return (
    <Container className="my-5">
      <h2>My Applications</h2>
      <p className="text-muted">Track your submitted applications.</p>
      {applications.length === 0 ? (
        <p className="text-muted">You have no applications yet. <Link to="/apply">Apply now</Link>.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td>{app.type}</td>
                <td>{statusBadge(app.status)}</td>
                <td>{new Date(app.created_at).toLocaleDateString()}</td>
                <td>{new Date(app.updated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="mt-3">
        <Button as={Link} to="/apply" variant="outline-primary">New Application</Button>
      </div>
    </Container>
  );
};

export default MyApplications;
