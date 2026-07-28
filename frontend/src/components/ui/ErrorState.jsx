import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  description = 'We could not load the content. Please try again.',
  icon = '😔',
  onRetry,
  className = '',
}) => {
  return (
    <Container className={`text-center py-5 ${className}`}>
      <Row>
        <Col md={6} lg={4} className="mx-auto">
          <div style={{ fontSize: '4rem' }}>{icon}</div>
          <h4 className="mt-3 fw-bold">{title}</h4>
          <p className="text-muted">{description}</p>
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Retry
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorState;
