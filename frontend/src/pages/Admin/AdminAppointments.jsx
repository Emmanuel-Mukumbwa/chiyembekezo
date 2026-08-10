import React, { useEffect, useState } from 'react';
import { Container, Badge, Button, Modal, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, ErrorState, LoadingSkeleton, SearchBar } from '../../components/ui';

const AdminAppointments = () => {
  const { showModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [search]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/appointments?search=${search}`);
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
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
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
            style={{ width: '130px' }}
          />
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Appointments</h4>
      <LoadingSkeleton type="list" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading appointments" description={error} onRetry={fetchAppointments} />;

  return (
    <>
      <Container fluid className="px-4">
        <h4 className="mb-4">Appointments</h4>
        <div className="mb-3" style={{ maxWidth: '300px' }}>
          <SearchBar value={search} onChange={setSearch} onSearch={fetchAppointments} placeholder="Search by user or professional..." />
        </div>
        <DataTable columns={columns} data={appointments} keyField="id" />
      </Container>

      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Appointment Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              <p><strong>User:</strong> {previewItem.user_email}</p>
              <p><strong>Professional:</strong> {previewItem.professional_first} {previewItem.professional_last}</p>
              <p><strong>Scheduled:</strong> {new Date(previewItem.scheduled_time).toLocaleString()}</p>
              <p><strong>Type:</strong> {previewItem.meeting_type}</p>
              <p><strong>Status:</strong> <Badge bg={statusVariant[previewItem.status]}>{previewItem.status}</Badge></p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminAppointments;
