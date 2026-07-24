import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminInvitations = () => {
  const { showModal } = useModal();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/admin/invitations', { email, role });
      showModal('Success', res.data.message || 'Invitation sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h4>Send Invitation</h4>
      <Card className="feature-card p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="volunteer">Volunteer</option>
              <option value="org_admin">Organization Admin</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AdminInvitations;