import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminApplications = () => {
  const { showModal } = useModal();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      const res = await api.get(`/admin/applications?${params}`);
      setApplications(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      showModal('Success', `Application ${status}.`);
      fetchData();
    } catch (err) {
      showModal('Error', 'Failed to review application.');
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container>
      <h4>Applications</h4>
      <div className="mb-3 d-flex gap-2">
        <Form.Select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} style={{ width: '150px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
        <Form.Select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} style={{ width: '150px' }}>
          <option value="">All Types</option>
          <option value="professional">Professional</option>
          <option value="volunteer">Volunteer</option>
        </Form.Select>
        <Button variant="primary" onClick={fetchData}>Filter</Button>
      </div>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Specialization</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No applications.</td></tr>
          ) : (
            applications.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.first_name} {a.last_name} ({a.email})</td>
                <td>{a.type}</td>
                <td>{a.specialization || '-'}</td>
                <td>
                  <Badge bg={
                    a.status === 'pending' ? 'warning' :
                    a.status === 'approved' ? 'success' : 'danger'
                  }>
                    {a.status}
                  </Badge>
                </td>
                <td>
                  {a.status === 'pending' && (
                    <>
                      <Button variant="success" size="sm" onClick={() => review(a.id, 'approved')}>Approve</Button>
                      <Button variant="danger" size="sm" className="ms-1" onClick={() => review(a.id, 'rejected')}>Reject</Button>
                    </>
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

export default AdminApplications;