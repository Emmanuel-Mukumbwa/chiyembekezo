import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminAppointments = () => {
  const { showModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      showModal('Error', 'Failed to update appointment.');
    }
  };

  const statusVariant = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'secondary',
    no_show: 'danger',
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Appointments</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Professional</th>
            <th>Scheduled</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.user_email}</td>
              <td>{a.professional_first} {a.professional_last}</td>
              <td>{new Date(a.scheduled_time).toLocaleString()}</td>
              <td>{a.meeting_type || '-'}</td>
              <td>
                <Badge bg={statusVariant[a.status] || 'secondary'}>
                  {a.status}
                </Badge>
              </td>
              <td>
                <Form.Select
                  size="sm"
                  value={a.status}
                  onChange={(e) => updateStatus(a.id, e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirm</option>
                  <option value="completed">Complete</option>
                  <option value="cancelled">Cancel</option>
                  <option value="no_show">No Show</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminAppointments;