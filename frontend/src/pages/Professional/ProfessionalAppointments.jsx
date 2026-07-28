import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  Input,
  Select,
  DataTable,
  StatCard,
  EmptyState,
  ErrorState,
} from '../../components/ui';

const ProfessionalAppointments = () => {
  const { showModal } = useModal();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/professional/appointments/upcoming'),
        api.get('/professional/appointments/past'),
      ]);
      setUpcoming(upcomingRes.data);
      setPast(pastRes.data);
    } catch (err) {
      setError('Failed to load appointments.');
      showModal('Error', 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/professional/appointments/${id}/status`, { status });
      showModal('Success', 'Status updated.');
      fetchAppointments();
    } catch (err) {
      showModal('Error', 'Failed to update status.');
    }
  };

  const addNote = async (id) => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/professional/appointments/${id}/note`, { note: noteText });
      showModal('Success', 'Note added.');
      setShowNoteModal(false);
      setNoteText('');
      fetchAppointments();
    } catch (err) {
      showModal('Error', 'Failed to add note.');
    }
  };

  const openNoteModal = (appt) => {
    setSelectedAppointment(appt);
    setShowNoteModal(true);
  };

  const statusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'danger',
      no_show: 'secondary',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const upcomingColumns = [
    { field: 'first_name', label: 'Patient', render: (val, row) => (
        <Link to={`/professional/patients/${row.user_id}`}>{row.first_name} {row.last_name}</Link>
      ) },
    { field: 'scheduled_time', label: 'Time', render: (val) => new Date(val).toLocaleString() },
    { field: 'status', label: 'Status', render: (val) => statusBadge(val) },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1 align-items-center">
          <Button variant="outline-primary" size="sm" onClick={() => openNoteModal(row)}>Add Note</Button>
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
            style={{ width: '120px' }}
          />
        </div>
      ),
    },
  ];

  const pastColumns = [
    { field: 'first_name', label: 'Patient', render: (val, row) => (
        <Link to={`/professional/patients/${row.user_id}`}>{row.first_name} {row.last_name}</Link>
      ) },
    { field: 'scheduled_time', label: 'Time', render: (val) => new Date(val).toLocaleString() },
    { field: 'status', label: 'Status', render: (val) => statusBadge(val) },
    { field: 'rating', label: 'Rating', render: (val) => val ? `${val}⭐` : '-' },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading appointments" description={error} onRetry={fetchAppointments} />;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Appointments</h4>
      <Row>
        <Col lg={6}>
          <h6>Upcoming</h6>
          {upcoming.length === 0 ? (
            <EmptyState icon="📅" title="No upcoming appointments" description="You have no upcoming appointments." />
          ) : (
            <DataTable columns={upcomingColumns} data={upcoming} keyField="id" />
          )}
        </Col>
        <Col lg={6}>
          <h6>Past (Last 50)</h6>
          {past.length === 0 ? (
            <EmptyState icon="📋" title="No past appointments" description="No past appointments found." />
          ) : (
            <DataTable columns={pastColumns} data={past} keyField="id" />
          )}
        </Col>
      </Row>

      {/* Add Note Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add Professional Note</Modal.Title></Modal.Header>
        <Modal.Body>
          <Input
            label="Note"
            name="note"
            as="textarea"
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter clinical note..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => addNote(selectedAppointment?.id)}>Save Note</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfessionalAppointments;
