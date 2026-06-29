import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AssessmentCard from '../../components/AssessmentCard';

const assessments = [
  {
    slug: 'phq9',
    title: 'Depression Screening',
    description: 'Quick 2-minute check-in (PHQ-9)',
    icon: '😔'
  },
  {
    slug: 'gad7',
    title: 'Anxiety Screening',
    description: 'Assess your anxiety level (GAD-7)',
    icon: '😰'
  },
  // add more later
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
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Assessments;