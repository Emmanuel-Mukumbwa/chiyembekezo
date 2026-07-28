import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import { Button, Card } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const ListenerDashboard = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();

  usePrompt(
    () => {
      logout();
      window.location.href = '/login';
    },
    () => {}
  );

  return (
    <Container fluid className="px-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold">Listener Dashboard</h2>
          <p className="text-muted">Welcome back! You're making a difference.</p>
        </div>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Row className="mt-3 g-3">
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
