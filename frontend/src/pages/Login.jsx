import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const roleDashboards = {
        admin: '/admin',
        professional: '/professional',
        volunteer: '/volunteer/dashboard',
        org_admin: '/organization',
        listener: '/listener/dashboard',
        user: '/dashboard',
      };
      const dashboardPath = roleDashboards[user.role] || '/dashboard';
      navigate(dashboardPath);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <div style={{ fontSize: '3rem' }}>🌿</div>
              <h3 className="fw-bold" style={{ color: 'var(--color-text)' }}>Welcome Back</h3>
              <p className="text-muted">Sign in to continue your wellness journey.</p>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control-lg"
                  placeholder="you@example.com"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    className="form-control-lg"
                    placeholder="Enter your password"
                  />
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </Button>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/forgot-password" className="small">Forgot password?</Link>
              </div>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="fw-semibold">Sign Up</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
