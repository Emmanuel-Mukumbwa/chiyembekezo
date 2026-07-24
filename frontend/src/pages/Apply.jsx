import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Apply = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [type, setType] = useState('professional');
  const [formData, setFormData] = useState({
    message: '',
    qualifications: '',
    experience: '',
    specialization: '',
    license_number: '',
    languages: '',
    availability: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        type,
        ...formData,
        languages: formData.languages ? formData.languages.split(',').map(l => l.trim()) : [],
      };
      await api.post('/applications', payload);
      showModal('Success', 'Application submitted successfully. We will review it shortly.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Container className="my-5 text-center"><h3>Please log in to apply.</h3></Container>;
  }

  return (
    <Container className="my-5">
      <h2>Apply to Become a {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
      <Card className="feature-card p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Application Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="volunteer">Volunteer</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message (why you want to join)</Form.Label>
            <Form.Control as="textarea" rows={2} name="message" value={formData.message} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Qualifications</Form.Label>
            <Form.Control name="qualifications" value={formData.qualifications} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Experience</Form.Label>
            <Form.Control name="experience" value={formData.experience} onChange={handleChange} />
          </Form.Group>
          {type === 'professional' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Control name="specialization" value={formData.specialization} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>License Number</Form.Label>
                <Form.Control name="license_number" value={formData.license_number} onChange={handleChange} />
              </Form.Group>
            </>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Languages (comma separated, e.g. English, Chichewa)</Form.Label>
            <Form.Control name="languages" value={formData.languages} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Availability</Form.Label>
            <Form.Control name="availability" value={formData.availability} onChange={handleChange} />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Apply;