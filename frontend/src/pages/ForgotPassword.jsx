import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="bg-surface border-0 shadow-sm rounded-lg p-4">
            <div className="text-center mb-3">
              <div style={{ fontSize: '3rem' }}>🔑</div>
              <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Reset Password</h3>
              <p className="text-muted">Enter your email and we'll send you a reset link.</p>
            </div>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" size="lg" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <Link to="/login" className="small">Back to Login</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
