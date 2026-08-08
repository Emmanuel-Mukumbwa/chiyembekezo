import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

const NotFound = () => {
  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-5 text-center">
            <div style={{ fontSize: '5rem' }}>🔍</div>
            <h1 className="display-4 fw-bold mt-3">404</h1>
            <h2 className="h4 mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for doesn't exist or has been moved.
            </p>
            <Button as={Link} to="/" variant="primary" size="lg">
              Go Back Home
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
