import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const SafetyPlan = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [plan, setPlan] = useState({
    trusted_people: '',
    reasons_to_live: '',
    calming_things: '',
    emergency_contacts: '',
    safe_places: '',
    coping_skills: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchPlan();
  }, [user]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/safety-plan');
      setPlan(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load safety plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPlan({ ...plan, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/safety-plan', plan);
      showModal('Success', 'Safety plan saved!');
    } catch (err) {
      showModal('Error', 'Failed to save safety plan.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to manage your safety plan.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Safety Plan</h2>
        <Button as={Link} to="/dashboard" variant="outline-secondary">
          ← Back to Dashboard
        </Button>
      </div>
      <Card className="feature-card p-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>People I trust</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="trusted_people"
              value={plan.trusted_people}
              onChange={handleChange}
              placeholder="List people you can contact when you need support."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Reasons to live</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="reasons_to_live"
              value={plan.reasons_to_live}
              onChange={handleChange}
              placeholder="What keeps you going?"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Things that calm me</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="calming_things"
              value={plan.calming_things}
              onChange={handleChange}
              placeholder="Activities or thoughts that help you relax."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Emergency contacts</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="emergency_contacts"
              value={plan.emergency_contacts}
              onChange={handleChange}
              placeholder="Phone numbers for crisis helplines, doctors, etc."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Safe places</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="safe_places"
              value={plan.safe_places}
              onChange={handleChange}
              placeholder="Places where you feel safe."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>My coping skills</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="coping_skills"
              value={plan.coping_skills}
              onChange={handleChange}
              placeholder="List healthy ways to cope with difficult emotions."
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Safety Plan'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default SafetyPlan;