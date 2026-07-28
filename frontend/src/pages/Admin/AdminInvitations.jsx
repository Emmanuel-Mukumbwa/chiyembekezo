import React, { useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, Select } from '../../components/ui';

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
    <Container fluid className="px-4">
      <h4 className="mb-4">Send Invitation</h4>
      <Card className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            name="role"
            value={role}
            options={[
              { value: 'professional', label: 'Professional' },
              { value: 'volunteer', label: 'Volunteer' },
              { value: 'org_admin', label: 'Organization Admin' },
            ]}
            onChange={(e) => setRole(e.target.value)}
          />
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default AdminInvitations;
