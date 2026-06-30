import React from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import AssessmentCard from '../../components/AssessmentCard';

const assessments = [
  {
    slug: 'phq9',
    title: 'Depression Screening',
    description: 'Patient Health Questionnaire (PHQ-9)',
    icon: '😔',
    available: true
  },
  {
    slug: 'gad7',
    title: 'Anxiety Screening',
    description: 'Generalized Anxiety Disorder (GAD-7)',
    icon: '😰',
    available: true
  },
  {
    slug: 'stress',
    title: 'Stress Test',
    description: 'Perceived Stress Scale (PSS-10)',
    icon: '😩',
    available: true
  },
  {
    slug: 'sleep',
    title: 'Sleep Test',
    description: 'Insomnia Severity Index (ISI)',
    icon: '😴',
    available: true
  },
  {
    slug: 'burnout',
    title: 'Burnout Test',
    description: 'Copenhagen Burnout Inventory (CBI)',
    icon: '🔥',
    available: true
  }
];

const Assessments = () => {
  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Mental Health Self-Assessments</h2>
      <p className="text-center text-muted mb-4">
        Take a quick screening to understand your mental wellbeing. These are not diagnoses, but can help guide you.
      </p>
      <Row>
        {assessments.map((a) => (
          <Col md={4} key={a.slug} className="mb-3">
            <AssessmentCard {...a} />
            {!a.available && (
              <Badge bg="secondary" className="mt-2 d-block text-center">Coming Soon</Badge>
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Assessments;