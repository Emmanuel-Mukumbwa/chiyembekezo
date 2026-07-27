import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import { Card, Button } from '../../components/ui';

const ListenerDashboard = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();

  // Block navigation to /login with confirmation
  usePrompt(
    () => {
      logout();
      navigate('/login');
    },
    () => {}
  );

  const handleLogout = () => {
    showModal(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        navigate('/login');
      }
    );
  };

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Listener Dashboard</h2>
          <p className="text-muted">Welcome back! You're making a difference.</p>
        </div>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
      </div>
      <Row className="mt-3">
        <Col md={6}>
          <Card className="p-3 text-center">
            <h6>Active Sessions</h6>
            <Button variant="outline-primary">View Sessions</Button>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 text-center">
            <h6>Availability</h6>
            <Button variant="outline-primary">Set Availability</Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ListenerDashboard;
