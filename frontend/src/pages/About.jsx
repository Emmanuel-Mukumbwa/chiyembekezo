import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">About Chiyembekezo</h1>
          <p className="hero-subtitle">
            Supporting mental wellness through education, self-care tools, trusted resources, and connections to professional help.
          </p>
          <div className="mt-4 d-flex flex-wrap justify-content-center gap-3">
            <Button variant="primary" as={Link} to="/assessments">Take Assessment</Button>
            <Button variant="outline-primary" as={Link} to="/resources">Learn More</Button>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <Container className="my-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2>Our Story</h2>
            <p>
              Mental health challenges are widespread in Malawi, yet access to support is limited. 
              Many people face stigma, long travel distances, high costs, and a shortage of trained professionals. 
              Young people often struggle in silence.
            </p>
            <p>
              Chiyembekezo was created to bridge this gap. We believe that everyone deserves access to 
              mental wellness support—regardless of location, income, or background.
            </p>
          </Col>
          <Col md={6} className="text-center">
            <div style={{ fontSize: '6rem' }}>🌱</div>
            <p className="text-muted">Growing hope, one step at a time.</p>
          </Col>
        </Row>
      </Container>

      {/* Mission & Vision */}
      <Container className="my-5">
        <Row>
          <Col md={6} className="mb-3">
            <Card className="feature-card p-4 h-100">
              <Card.Body>
                <h3 className="text-primary">Our Mission</h3>
                <p>To make mental wellness support accessible, affordable, and stigma-free for everyone in Malawi.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="feature-card p-4 h-100">
              <Card.Body>
                <h3 className="text-primary">Our Vision</h3>
                <p>A Malawi where everyone has access to mental wellness support, regardless of location or income.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Values */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Our Values</h2>
        <Row className="justify-content-center">
          {[
            { emoji: '❤️', label: 'Compassion' },
            { emoji: '🤝', label: 'Respect' },
            { emoji: '🔒', label: 'Privacy' },
            { emoji: '🌱', label: 'Growth' },
            { emoji: '📚', label: 'Education' },
            { emoji: '💙', label: 'Hope' },
            { emoji: '🌍', label: 'Inclusion' },
          ].map((item, idx) => (
            <Col xs={6} sm={4} md={3} key={idx} className="text-center mb-3">
              <div style={{ fontSize: '3rem' }}>{item.emoji}</div>
              <div>{item.label}</div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* What We Offer */}
      <Container className="my-5">
        <h2 className="text-center mb-4">What We Offer</h2>
        <Row>
          {[
            'Mood Tracking', 'Journal', 'Assessments', 'AI Companion',
            'Professional Directory', 'Community Support', 'Resources', 'Appointments'
          ].map((item, idx) => (
            <Col md={3} sm={6} key={idx} className="mb-3">
              <Card className="feature-card text-center p-3">
                <Card.Body>
                  <Card.Title>{item}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <Container className="my-5">
        <h2 className="text-center mb-4">How It Works</h2>
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {[
                'Visit Platform', 'Learn', 'Take Assessment', 'Track Mood',
                'Get Recommendations', 'Talk to Professional', 'Improve Wellness'
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '60px', height: '60px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{idx + 1}</span>
                  </div>
                  <div className="mt-2 small">{step}</div>
                  {idx < 6 && <div className="text-muted">→</div>}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Privacy & Disclaimer */}
      <Container className="my-5">
        <Row>
          <Col md={6}>
            <Card className="feature-card p-4">
              <h4>🔒 Privacy & Confidentiality</h4>
              <p>Your data is encrypted, we respect your privacy, you control your information, and we never sell your personal data.</p>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card p-4 border-danger">
              <h4>⚠️ Important Disclaimer</h4>
              <p className="text-muted">
                This platform is not an emergency service and does not replace professional medical care.
                If you are experiencing a crisis, please seek immediate help.
              </p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="text-center my-5 py-4 bg-light rounded-3">
        <h3>Start Your Wellness Journey</h3>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button variant="primary" as={Link} to="/assessments">Take Assessment</Button>
          <Button variant="outline-primary" as={Link} to="/register">Register</Button>
        </div>
      </Container>
    </main>
  );
};

export default About;