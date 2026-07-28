import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  Button,
  Input,
  Select,
  DataTable,
  EmptyState,
  ErrorState,
} from '../../components/ui';

const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

const ProfessionalAvailability = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      const res = await api.get('/professional/availability');
      setAvailability(res.data);
    } catch (err) {
      setError('Failed to load availability.');
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
    try {
      await api.delete(`/professional/availability/${id}`);
      showModal('Success', 'Slot deleted.');
      fetchAvailability();
    } catch (err) {
      showModal('Error', 'Failed to delete slot.');
    }
  };

  if (!user?.isProfessional) {
    return <Container className="my-5"><h3>You are not a professional.</h3></Container>;
  }

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading availability" description={error} onRetry={fetchAvailability} />;

  const columns = [
    { field: 'day_of_week', label: 'Day' },
    { field: 'start_time', label: 'Start' },
    { field: 'end_time', label: 'End' },
    { field: 'is_recurring', label: 'Type', render: (val) => val ? 'Recurring' : 'Specific Date' },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button variant="danger" size="sm" onClick={() => deleteSlot(row.id)}>Delete</Button>
      ),
    },
  ];

  return (
    <Container fluid className="px-4">
      <h2>Manage Your Availability</h2>
      <form onSubmit={addSlot} className="bg-light p-3 rounded mb-4">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Select
              label="Day"
              name="day_of_week"
              value={slotForm.day_of_week}
              options={daysOfWeek.map(day => ({ value: day, label: day }))}
              onChange={handleSlotChange}
            />
          </Col>
          <Col md={2}>
            <Input
              label="Start"
              name="start_time"
              type="time"
              value={slotForm.start_time}
              onChange={handleSlotChange}
            />
          </Col>
          <Col md={2}>
            <Input
              label="End"
              name="end_time"
              type="time"
              value={slotForm.end_time}
              onChange={handleSlotChange}
            />
          </Col>
          <Col md={2}>
            <Select
              label="Recurring?"
              name="is_recurring"
              value={slotForm.is_recurring}
              options={[
                { value: true, label: 'Yes (weekly)' },
                { value: false, label: 'Specific date' },
              ]}
              onChange={handleSlotChange}
            />
          </Col>
          <Col md={2}>
            {slotForm.is_recurring === 'false' && (
              <Input
                label="Date"
                name="specific_date"
                type="date"
                value={slotForm.specific_date}
                onChange={handleSlotChange}
              />
            )}
          </Col>
          <Col md={1}>
            <Button type="submit" variant="primary">Add</Button>
          </Col>
        </Row>
      </form>

      {availability.length === 0 ? (
        <EmptyState icon="🕒" title="No slots set" description="Add your first availability slot." />
      ) : (
        <DataTable columns={columns} data={availability} keyField="id" />
      )}
      <Button as={Link} to="/professional" variant="outline-secondary" className="mt-3">
        Back to Dashboard
      </Button>
    </Container>
  );
};

export default ProfessionalAvailability;
