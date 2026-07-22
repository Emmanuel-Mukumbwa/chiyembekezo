import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const ProfessionalAvailability = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '17:00',
    is_recurring: true,
    specific_date: '',
  });

  useEffect(() => {
    if (user?.isProfessional) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // We need the professional id; we can get from user's profile or separate endpoint.
      // For simplicity, assume user is a professional and we fetch their own slots.
      const res = await api.get(`/professional/availability`);
      setAvailability(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotChange = (e) => {
    setSlotForm({ ...slotForm, [e.target.name]: e.target.value });
  };

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      const slots = [...availability, slotForm];
      await api.put('/professional/availability', { slots });
      showModal('Success', 'Availability updated.');
      fetchAvailability();
    } catch (err) {
      showModal('Error', 'Failed to update availability.');
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/professional/availability/${id}`);
      fetchAvailability();
    } catch (err) {
      showModal('Error', 'Failed to delete slot.');
    }
  };

  if (!user?.isProfessional) {
    return <Container className="my-5"><h3>You are not a professional.</h3></Container>;
  }

  if (loading) return <Spinner animation="border" className="my-5" />;

  return (
    <Container className="my-5">
      <h2>Manage Your Availability</h2>
      <Card className="feature-card p-3 mb-4">
        <h5>Add Time Slot</h5>
        <Form onSubmit={addSlot}>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Day</Form.Label>
                <Form.Select name="day_of_week" value={slotForm.day_of_week} onChange={handleSlotChange}>
                  {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Start</Form.Label>
                <Form.Control type="time" name="start_time" value={slotForm.start_time} onChange={handleSlotChange} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>End</Form.Label>
                <Form.Control type="time" name="end_time" value={slotForm.end_time} onChange={handleSlotChange} />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Recurring?</Form.Label>
                <Form.Select name="is_recurring" value={slotForm.is_recurring} onChange={handleSlotChange}>
                  <option value="true">Yes (weekly)</option>
                  <option value="false">Specific date</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              {slotForm.is_recurring === 'false' && (
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="specific_date" value={slotForm.specific_date} onChange={handleSlotChange} />
                </Form.Group>
              )}
            </Col>
            <Col md={1}>
              <Button type="submit" variant="primary">Add</Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="feature-card p-3">
        <h5>Current Availability</h5>
        <Table striped hover responsive>
          <thead>
            <tr><th>Day</th><th>Start</th><th>End</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {availability.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No slots set.</td></tr>
            ) : (
              availability.map(slot => (
                <tr key={slot.id}>
                  <td>{slot.day_of_week}</td>
                  <td>{slot.start_time}</td>
                  <td>{slot.end_time}</td>
                  <td>{slot.is_recurring ? 'Recurring' : slot.specific_date}</td>
                  <td><Button variant="danger" size="sm" onClick={() => deleteSlot(slot.id)}>Delete</Button></td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
      <div className="mt-3">
        <Button as={Link} to="/professional" variant="outline-secondary">Back to Professional Dashboard</Button>
      </div>
    </Container>
  );
};

export default ProfessionalAvailability;