import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Button from './Button';

const EmptyState = ({ icon = '🌱', title, description, actionText, onAction }) => {
  return (
    <Container className="text-center py-5">
      <Row>
        <Col md={6} className="mx-auto">
          <div style={{ fontSize: '4rem' }}>{icon}</div>
          <h4 className="mt-3">{title}</h4>
          <p className="text-muted">{description}</p>
          {actionText && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EmptyState;
