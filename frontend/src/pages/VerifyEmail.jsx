import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. Please try again.');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="bg-surface border-0 shadow-sm rounded-lg p-4 text-center">
            {status === 'verifying' && (
              <>
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h4>Verifying your email...</h4>
                <p className="text-muted">Please wait while we confirm your email address.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div style={{ fontSize: '4rem' }}>✅</div>
                <h4 className="mt-2">Email Verified!</h4>
                <p className="text-muted">{message}</p>
                <p className="text-muted small">Redirecting to login...</p>
                <Button as={Link} to="/login" variant="primary" size="sm">
                  Go to Login
                </Button>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ fontSize: '4rem' }}>⚠️</div>
                <h4 className="mt-2">Verification Failed</h4>
                <Alert variant="danger">{message}</Alert>
                <Button as={Link} to="/login" variant="outline-primary" size="sm">
                  Back to Login
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;
