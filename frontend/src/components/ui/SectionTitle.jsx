import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const SectionTitle = ({ title, subtitle, center = true }) => {
  const alignment = center ? 'text-center' : '';
  return (
    <Container className={`mb-5 ${alignment}`}>
      <Row>
        <Col lg={8} className="mx-auto">
          <h2 className="display-5 fw-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          {subtitle && <p className="lead text-muted">{subtitle}</p>}
          <hr className="w-25 mx-auto" style={{ borderTop: '3px solid var(--color-primary-400)' }} />
        </Col>
      </Row>
    </Container>
  );
};

export default SectionTitle;
