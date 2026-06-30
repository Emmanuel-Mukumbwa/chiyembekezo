import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useModal } from '../context/ModalContext';

const Contact = () => {
  const { showModal } = useModal();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending
    showModal('Message Sent', 'Thank you for contacting us. We will get back to you soon.');
    setSubmitted(true);
    // Reset after a moment
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Contact Us</h1>
          <p className="hero-subtitle">We're here to help. Reach out to us with any questions or feedback.</p>
        </Container>
      </section>

      <Container className="my-5">
        <Row>
          <Col md={6}>
            <Card className="feature-card p-4">
              <h4>Send a Message</h4>
              {submitted && <Alert variant="success">Message sent successfully!</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit">Send</Button>
              </Form>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card p-4">
              <h4>Contact Information</h4>
              <p><strong>Email:</strong> hello@chiyembekezo.mw</p>
              <p><strong>Phone:</strong> +265 999 123 456</p>
              <p><strong>WhatsApp:</strong> +265 888 123 456</p>
              <p><strong>Office:</strong> Lilongwe, Malawi (future)</p>
              <p><strong>Hours:</strong> Mon–Fri, 8am – 5pm</p>
              <hr />
              <h6>🚨 Emergency</h6>
              <p>If you are in immediate danger, please call <strong>999</strong> (Police) or go to your nearest hospital.</p>
              <div className="mt-3">
                <h6>Connect with us</h6>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm">Facebook</Button>
                  <Button variant="outline-primary" size="sm">Instagram</Button>
                  <Button variant="outline-primary" size="sm">YouTube</Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Contact;