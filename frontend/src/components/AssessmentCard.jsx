import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AssessmentCard = ({ title, description, slug, icon }) => {
  return (
    <Card className="feature-card h-100">
      <Card.Body>
        <div className="text-center mb-2" style={{ fontSize: '2.5rem' }}>{icon}</div>
        <Card.Title>{title}</Card.Title>
        <Card.Text className="text-muted small">{description}</Card.Text>
        <Button as={Link} to={`/assessments/${slug}`} variant="primary" size="sm">
          Start Test
        </Button>
      </Card.Body>
    </Card>
  );
};

export default AssessmentCard;