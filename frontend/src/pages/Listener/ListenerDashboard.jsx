import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ListenerDashboard = () => {
  return (
    <Container className="my-5">
      <h2>Listener Dashboard</h2>
      <Row>
        <Col md={6}>
          <Card className="feature-card p-3">
            <h5>Active Sessions</h5>
            <Button variant="outline-primary">View Sessions</Button>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="feature-card p-3">
            <h5>Availability</h5>
            <Button variant="outline-primary">Set Availability</Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ListenerDashboard;