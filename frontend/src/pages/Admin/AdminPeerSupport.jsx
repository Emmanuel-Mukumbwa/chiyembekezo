import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  Select,
  DataTable,
  ErrorState,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminPeerSupport = () => {
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, volRes] = await Promise.all([
        api.get(`/admin/peer-support/requests?status=${filterStatus}`),
        api.get('/admin/volunteers'),
      ]);
      setRequests(reqRes.data);
      setVolunteers(volRes.data);
    } catch (err) {
      setError('Failed to load data.');
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
    showModal(
      'Confirm Unassign',
      'Are you sure you want to unassign this volunteer?',
      async () => {
        try {
          await api.put(`/admin/peer-support/requests/${requestId}/unassign`);
          showModal('Success', 'Volunteer unassigned.');
          fetchData();
        } catch (err) {
          showModal('Error', 'Failed to unassign volunteer.');
        }
      }
    );
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'user_first', label: 'User', render: (val, row) => `${row.user_first} ${row.user_last}` },
    { field: 'message', label: 'Message' },
    {
      field: 'status',
      label: 'Status',
      render: (val) => {
        const colors = { pending: 'warning', accepted: 'info', completed: 'success', cancelled: 'secondary' };
        return <Badge bg={colors[val] || 'secondary'}>{val}</Badge>;
      },
    },
    { field: 'volunteer_id', label: 'Volunteer', render: (val, row) => val ? `${row.vol_first} ${row.vol_last}` : 'Not assigned' },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1 align-items-center">
          {row.status === 'pending' && (
            <Select
              name="assign"
              value=""
              options={[
                { value: '', label: 'Assign volunteer' },
                ...volunteers.filter(v => v.is_verified).map(v => ({ value: v.id, label: `${v.first_name} ${v.last_name}` })),
              ]}
              onChange={(e) => {
                if (e.target.value) {
                  assignVolunteer(row.id, parseInt(e.target.value));
                }
              }}
              className="mb-0"
              style={{ width: '150px' }}
            />
          )}
          {row.volunteer_id && (
            <Button variant="outline-danger" size="sm" onClick={() => unassignVolunteer(row.id)}>Unassign</Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading data" description={error} onRetry={fetchData} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Peer Support Requests</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Select
            label="Filter by Status"
            name="status"
            value={filterStatus}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchData}>Apply</Button>
        </Col>
      </Row>
      <DataTable columns={columns} data={requests} keyField="id" />
    </Container>
  );
};

export default AdminPeerSupport;
