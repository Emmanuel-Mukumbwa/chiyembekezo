import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import api from '../services/api';

const Register = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [inviteData, setInviteData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (inviteToken) {
      api.get(`/invitations/validate?token=${inviteToken}`)
        .then(res => {
          setInviteData(res.data);
          setFormData(prev => ({ ...prev, email: res.data.email }));
        })
        .catch(() => setError('Invalid or expired invitation token.'));
    }
  }, [inviteToken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const userData = await register(registerData);

      if (inviteToken) {
        await api.post('/invitations/accept', { token: inviteToken, userId: userData.id });
      }

      const roleDashboards = {
        admin: '/admin',
        professional: '/professional',
        volunteer: '/volunteer/dashboard',
        org_admin: '/organization',
        listener: '/listener/dashboard',
        user: '/dashboard',
      };
      const dashboardPath = roleDashboards[userData.role] || '/dashboard';
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          {/* Back to Home link */}
          <div className="mb-3">
            <Link to="/" className="text-muted small text-decoration-none">
              ← Back to Home
            </Link>
          </div>
          <Card className="bg-surface border-0 shadow-sm rounded-lg p-4">
            <div className="text-center mb-3">
              <div style={{ fontSize: '3rem' }}>🌱</div>
              <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Create Account</h3>
              <p className="text-muted">
                {inviteData ? `Join as ${inviteData.role}` : 'Start your wellness journey today.'}
              </p>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g., Emmanuel"
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g., Mukumbwa"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!inviteData?.email}
                  placeholder="you@example.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password (min 6 characters)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Create a strong password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone (optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+265 999 123 456"
                />
              </Form.Group>

              {inviteData && (
                <Form.Text className="text-muted d-block mb-2">
                  You are registering as a <strong>{inviteData.role}</strong>.
                </Form.Text>
              )}

              <Button variant="primary" size="lg" type="submit" className="w-100 mt-2" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="fw-semibold">Sign In</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
