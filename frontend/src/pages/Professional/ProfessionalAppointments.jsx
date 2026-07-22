import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const ProfessionalAppointments = () => {
  const { showModal } = useModal();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        api.get('/professional/appointments/upcoming'),
        api.get('/professional/appointments/past'),
      ]);
      setUpcoming(upcomingRes.data);
      setPast(pastRes.data);
    } catch (err) {
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

  if (loading) return <Spinner animation="border" />;

  return (
    <Container>
      <h4>Appointments</h4>
      <Row>
        <Col lg={6}>
          <Card className="feature-card p-3 mb-3">
            <h5>Upcoming</h5>
            <Table striped hover responsive>
              <thead>
                <tr><th>Patient</th><th>Time</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {upcoming.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">No upcoming appointments</td></tr>
                ) : (
                  upcoming.map(a => (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/professional/patients/${a.user_id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                      </td>
                      <td>{new Date(a.scheduled_time).toLocaleString()}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => openNoteModal(a)}>Add Note</Button>
                        <Form.Select size="sm" className="d-inline-block w-auto ms-1" onChange={(e) => updateStatus(a.id, e.target.value)} value={a.status}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                          <option value="no_show">No Show</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="feature-card p-3 mb-3">
            <h5>Past (Last 50)</h5>
            <Table striped hover responsive>
              <thead>
                <tr><th>Patient</th><th>Time</th><th>Status</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {past.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">No past appointments</td></tr>
                ) : (
                  past.map(a => (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/professional/patients/${a.user_id}`}>
                          {a.first_name} {a.last_name}
                        </Link>
                      </td>
                      <td>{new Date(a.scheduled_time).toLocaleString()}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td>{a.rating ? `${a.rating}⭐` : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      {/* Add Note Modal */}
      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Professional Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter clinical note..."
            />
          </Form.Group>
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