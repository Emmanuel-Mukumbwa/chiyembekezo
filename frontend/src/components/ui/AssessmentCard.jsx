import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const AssessmentCard = ({ title, description, icon, slug, available = true, onStart, ...rest }) => {
  return (
    <Card className="text-center p-3 h-100" hoverable="true" {...rest}>
      <div style={{ fontSize: '3rem' }}>{icon}</div>
      <h6 className="fw-bold mt-2">{title}</h6>
      <p className="text-muted small flex-grow-1">{description}</p>
      <div className="mt-2">
        {available ? (
          <Button variant="primary" size="sm" onClick={() => onStart?.(slug)}>
            Start Test
          </Button>
        ) : (
          <Badge bg="secondary">Coming Soon</Badge>
        )}
      </div>
    </Card>
  );
};

export default AssessmentCard;
