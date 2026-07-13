import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const ProfessionalProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledTime: '',
    durationMinutes: 60,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfessional();
  }, [id]);

  const fetchProfessional = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/professionals/${id}`);
      setPro(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load professional profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showModal('Login Required', 'Please log in to book an appointment.');
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        professionalId: id,
        scheduledTime: bookingData.scheduledTime,
        durationMinutes: bookingData.durationMinutes,
        notes: bookingData.notes,
      });
      showModal('Success', 'Appointment booked successfully!');
      setShowBooking(false);
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!pro) {
    return (
      <Container className="my-5 text-center">
        <h3>Professional not found</h3>
        <Button as={Link} to="/find-help">Back to Directory</Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button as={Link} to="/find-help" variant="outline-secondary" className="mb-3">
        ← Back to Directory
      </Button>
      <Row>
        <Col md={8}>
          <Card className="feature-card p-4">
            <div className="d-flex align-items-center">
              <div style={{ fontSize: '5rem' }}>👤</div>
              <div className="ms-4">
                <h2>{pro.first_name} {pro.last_name}</h2>
                <h5 className="text-muted">{pro.specialization}</h5>
                {pro.is_verified && <Badge bg="success">Verified Professional</Badge>}
              </div>
            </div>
            <hr />
            <div className="mb-2">
              <strong>⭐ Rating:</strong> {pro.avg_rating || 'No ratings yet'} ({pro.completed_sessions || 0} sessions)
            </div>
            <div className="mb-2">
              <strong>Experience:</strong> {pro.years_experience || 'N/A'} years
            </div>
            <div className="mb-2">
              <strong>Clinic:</strong> {pro.clinic_name || 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Location:</strong> {pro.district}, {pro.city || ''}
            </div>
            <div className="mb-2">
              <strong>Languages:</strong> {pro.languages?.join(', ') || 'N/A'}
            </div>
            <div className="mb-2">
              <strong>Consultation Fee:</strong> {pro.consultation_fee ? `MK ${pro.consultation_fee}` : 'Contact for fee'}
            </div>
            <div className="mb-2">
              <strong>License:</strong> {pro.license_number || 'N/A'}
            </div>
            <div className="mb-3">
              <strong>Bio:</strong>
              <p>{pro.bio || 'No bio provided'}</p>
            </div>
            <div className="mb-2">
              <strong>Availability:</strong>
              <ul className="list-unstyled">
                {Object.keys(pro.available_days || {}).map(day => (
                  <li key={day}>
                    <Badge bg="secondary">{day}</Badge>: {pro.available_days[day]?.join(', ') || 'Not available'}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="primary" onClick={() => setShowBooking(true)} className="mt-2">
              Book Appointment
            </Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="feature-card p-3">
            <h5>Contact</h5>
            <p><strong>Email:</strong> {pro.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {pro.phone || 'N/A'}</p>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBooking} onHide={() => setShowBooking(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment with {pro.first_name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={bookingData.scheduledTime}
                onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                min="15"
                step="15"
                value={bookingData.durationMinutes}
                onChange={(e) => setBookingData({ ...bookingData, durationMinutes: parseInt(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBooking(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Booking...' : 'Book'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProfessionalProfile;