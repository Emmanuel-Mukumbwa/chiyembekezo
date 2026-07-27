import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PageHeader = ({ title, subtitle, children, className = '' }) => {
  return (
    <section className={`hero-section text-center ${className}`} style={{ backgroundColor: 'var(--color-primary-50)' }}>
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            <h1 className="display-4 fw-bold" style={{ color: 'var(--color-text)' }}>{title}</h1>
            {subtitle && <p className="lead text-muted mt-2" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
            {children && <div className="mt-3">{children}</div>}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PageHeader;
