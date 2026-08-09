import React, { useEffect, useState } from 'react';
import { Container, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, ErrorState, LoadingSkeleton } from '../../components/ui';

const AdminAppointments = () => {
  const { showModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data);
    } catch (err) {
      setError('Failed to load appointments.');
      showModal('Error', 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status });
      fetchAppointments();
      showModal('Success', 'Appointment updated.');
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

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'user_email', label: 'User' },
    { field: 'professional_first', label: 'Professional', render: (val, row) => `${row.professional_first} ${row.professional_last}` },
    { field: 'scheduled_time', label: 'Scheduled', render: (val) => new Date(val).toLocaleString() },
    { field: 'meeting_type', label: 'Type', render: (val) => val || '-' },
    {
      field: 'status',
      label: 'Status',
      render: (val) => <Badge bg={statusVariant[val] || 'secondary'}>{val}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Select
          name="status"
          value={row.status}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirm' },
            { value: 'completed', label: 'Complete' },
            { value: 'cancelled', label: 'Cancel' },
            { value: 'no_show', label: 'No Show' },
          ]}
          onChange={(e) => updateStatus(row.id, e.target.value)}
          className="mb-0"
        />
      ),
    },
  ];

if (loading) return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Appointments</h4>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading appointments" description={error} onRetry={fetchAppointments} />;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Appointments</h4>
      <DataTable columns={columns} data={appointments} keyField="id" />
    </Container>
  );
};

export default AdminAppointments;
