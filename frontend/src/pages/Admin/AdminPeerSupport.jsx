import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner, Button, Form, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminPeerSupport = () => {
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, volRes] = await Promise.all([
        api.get(`/admin/peer-support/requests?status=${filterStatus}`),
        api.get('/admin/volunteers'), // we already have this endpoint
      ]);
      setRequests(reqRes.data);
      setVolunteers(volRes.data);
    } catch (err) {
      showModal('Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const assignVolunteer = async (requestId, volunteerId) => {
    try {
      await api.put(`/admin/peer-support/requests/${requestId}/assign`, { volunteerId });
      showModal('Success', 'Volunteer assigned.');
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to assign volunteer.');
    }
  };

  const unassignVolunteer = async (requestId) => {
    if (!window.confirm('Unassign volunteer?')) return;
    try {
      await api.put(`/admin/peer-support/requests/${requestId}/unassign`);
      showModal('Success', 'Volunteer unassigned.');
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to unassign volunteer.');
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container>
      <h4>Peer Support Requests</h4>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button variant="primary" onClick={fetchData}>Filter</Button>
        </Col>
      </Row>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Message</th>
            <th>Status</th>
            <th>Volunteer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No requests found.</td></tr>
          ) : (
            requests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.user_first} {req.user_last}</td>
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
                  {req.volunteer_id ? (
                    <span>{req.vol_first} {req.vol_last}</span>
                  ) : (
                    <span className="text-muted">Not assigned</span>
                  )}
                </td>
                <td>
                  {req.status === 'pending' && (
                    <Form.Select
                      size="sm"
                      style={{ width: '150px', display: 'inline-block' }}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignVolunteer(req.id, parseInt(e.target.value));
                        }
                      }}
                    >
                      <option value="">Assign volunteer</option>
                      {volunteers
                        .filter(v => v.is_verified)
                        .map(v => (
                          <option key={v.id} value={v.id}>
                            {v.first_name} {v.last_name}
                          </option>
                        ))}
                    </Form.Select>
                  )}
                  {req.volunteer_id && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-1"
                      onClick={() => unassignVolunteer(req.id)}
                    >
                      Unassign
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminPeerSupport;