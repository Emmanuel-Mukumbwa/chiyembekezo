import React, { useEffect, useState, useRef } from 'react';
import { Container, Badge, Button, Modal, Card, Row, Col, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, ErrorState, LoadingSkeleton, Input } from '../../components/ui';
import { FiFilter, FiX } from 'react-icons/fi';

const AppointmentCard = ({ apt, onStatusChange, onPreview }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{apt.user_email}</h6>
          <small className="text-muted">with {apt.professional_first} {apt.professional_last}</small>
          <br />
          <small className="text-muted">{new Date(apt.scheduled_time).toLocaleString()} · {apt.meeting_type || 'N/A'}</small>
        </div>
        <Badge bg={apt.status === 'pending' ? 'warning' : apt.status === 'confirmed' ? 'info' : apt.status === 'completed' ? 'success' : 'secondary'}>
          {apt.status}
        </Badge>
      </div>
      <div className="d-flex gap-2 mt-2 align-items-center">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(apt)}>Preview</Button>
        <Select
          name="status"
          value={apt.status}
          options={[
            { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirm' }, { value: 'completed', label: 'Complete' },
            { value: 'cancelled', label: 'Cancel' }, { value: 'no_show', label: 'No Show' }
          ]}
          onChange={(e) => onStatusChange(apt.id, e.target.value)}
          className="mb-0" style={{ width: '130px' }}
        />
      </div>
    </Card.Body>
  </Card>
);

const AdminAppointments = () => {
  const { showModal } = useModal();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/appointments?search=${appliedSearch}`);
      setAppointments(res.data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [appliedSearch]);

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status });
      fetchAppointments();
      showModal('Success', 'Appointment updated.');
    } catch {
      showModal('Error', 'Failed to update appointment.');
    }
  };

  const statusVariant = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'secondary', no_show: 'danger' };
  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'user_email', label: 'User' },
    { field: 'professional_first', label: 'Professional', render: (_, row) => `${row.professional_first} ${row.professional_last}` },
    { field: 'scheduled_time', label: 'Scheduled', render: (val) => new Date(val).toLocaleString() },
    { field: 'meeting_type', label: 'Type', render: (val) => val || '-' },
    { field: 'status', label: 'Status', render: (val) => <Badge bg={statusVariant[val] || 'secondary'}>{val}</Badge> },
    {
      field: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
          <Select name="status" value={row.status}
            options={[
              { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirm' }, { value: 'completed', label: 'Complete' },
              { value: 'cancelled', label: 'Cancel' }, { value: 'no_show', label: 'No Show' }
            ]}
            onChange={(e) => updateStatus(row.id, e.target.value)} className="mb-0" style={{ width: '130px' }} />
        </div>
      ),
    },
  ];

  if (loading) return <Container fluid className="px-4"><h4 className="mb-4">Appointments</h4><LoadingSkeleton type="list" /></Container>;
  if (error) return <ErrorState title="Error loading appointments" description={error} onRetry={fetchAppointments} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Appointments</h4>
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
        </div>

        <Collapse in={filtersOpen}>
          <div>
            <Row className="mb-3 g-2 align-items-end">
              <Col md={4}>
                <Input label="Search" name="search" value={search}
                  onChange={(e) => setSearch(e.target.value)} placeholder="Search by user or professional..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }} />
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button variant="primary" onClick={handleApply}>Apply</Button>
                <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </div>
        </Collapse>

        <div className="d-none d-md-block"><DataTable columns={columns} data={appointments} keyField="id" /></div>
        <div className="d-md-none">
          {appointments.length === 0 ? (
            <p className="text-center text-muted">No appointments found.</p>
          ) : (
            appointments.map(apt => <AppointmentCard key={apt.id} apt={apt} onStatusChange={updateStatus} onPreview={setPreviewItem} />)
          )}
        </div>
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
