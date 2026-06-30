import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Form, Badge } from 'react-bootstrap';

const faqData = [
  {
    category: 'General',
    q: 'What is Chiyembekezo?',
    a: 'Chiyembekezo is a digital platform that provides mental wellness resources, self-assessments, and support for people in Malawi. Our goal is to make mental health help accessible and reduce stigma.'
  },
  {
    category: 'General',
    q: 'Is the platform free?',
    a: 'Yes, all basic features (articles, assessments, breathing exercises, community reading) are free. Some advanced features like booking professionals or saving progress may require registration.'
  },
  {
    category: 'Account',
    q: 'Do I need an account to use the platform?',
    a: 'No. You can read resources, take assessments anonymously, and use breathing exercises without an account. You only need to register if you want to save your history or book appointments.'
  },
  {
    category: 'Account',
    q: 'How do I register?',
    a: 'Click the "Sign Up" button in the top right corner, fill in your details, and create a password. You will receive a confirmation email.'
  },
  {
    category: 'Account',
    q: 'How can I reset my password?',
    a: 'On the login page, click "Forgot Password" and follow the instructions sent to your email.'
  },
  {
    category: 'Privacy',
    q: 'Is my journal private?',
    a: 'Yes, your journal entries are private and encrypted. Only you can access them.'
  },
  {
    category: 'Privacy',
    q: 'Can my family see my information?',
    a: 'No, your information is strictly confidential. You control what you share.'
  },
  {
    category: 'Assessments',
    q: 'Are these assessments diagnoses?',
    a: 'No, these are screening tools to help you understand your mental wellbeing. They are not a replacement for professional diagnosis.'
  },
  {
    category: 'Assessments',
    q: 'How accurate are the results?',
    a: 'The tools we use (PHQ-9, GAD-7, etc.) are widely validated, but they are not 100% diagnostic. They are a guide to help you decide if you need further support.'
  },
  {
    category: 'AI Companion',
    q: 'Is the AI a psychologist?',
    a: 'No, the AI is a supportive tool that can help you explore your feelings and suggest coping strategies, but it is not a replacement for a human professional.'
  },
  {
    category: 'Professionals',
    q: 'How do appointments work?',
    a: 'You can search for a professional, view their profile, and book a time slot. Appointments can be in-person, video, or phone call.'
  },
  {
    category: 'Community',
    q: 'Can I post anonymously in the community?',
    a: 'Yes, you can choose to post anonymously in the forum to protect your identity.'
  },
  {
    category: 'Emergency',
    q: 'What if I am thinking about suicide?',
    a: 'Please call the emergency helpline immediately. Click the red "Emergency" button at the top of every page for immediate support.'
  }
];

const FAQ = () => {
  const [search, setSearch] = useState('');

  const filtered = faqData.filter(item =>
    item.q.toLowerCase().includes(search.toLowerCase()) ||
    item.a.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Frequently Asked Questions</h1>
          <p className="hero-subtitle">Find answers to common questions about Chiyembekezo.</p>
          <Form.Control
            type="text"
            placeholder="Search FAQ..."
            className="mt-3 mx-auto"
            style={{ maxWidth: '500px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Container>
      </section>

      <Container className="my-5">
        <Row>
          <Col md={3} className="mb-3">
            <h6>Categories</h6>
            <div className="d-flex flex-wrap gap-1">
              {categories.map(cat => (
                <Badge
                  key={cat}
                  bg="secondary"
                  className="mb-1"
                  onClick={() => setSearch(cat)}
                  style={{ cursor: 'pointer' }}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </Col>
          <Col md={9}>
            <Accordion alwaysOpen>
              {filtered.length === 0 ? (
                <p className="text-muted">No questions match your search.</p>
              ) : (
                filtered.map((item, idx) => (
                  <Accordion.Item eventKey={String(idx)} key={idx}>
                    <Accordion.Header>
                      <span className="me-2">
                        <Badge bg="light" text="dark">{item.category}</Badge>
                      </span>
                      {item.q}
                    </Accordion.Header>
                    <Accordion.Body>{item.a}</Accordion.Body>
                  </Accordion.Item>
                ))
              )}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default FAQ;