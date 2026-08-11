import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';

const FeatureCard = ({ icon, title, description, to, linkText = 'Learn More', ...rest }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (to) navigate(to);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="p-3 h-100 d-flex flex-column"
      hoverable="true"
      style={{ textAlign: 'center', cursor: to ? 'pointer' : 'default' }}
      onClick={handleCardClick}
      {...rest}
    >
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h5 className="fw-bold" style={{ color: 'var(--color-text)' }}>{title}</h5>
      <p className="text-muted small flex-grow-1" style={{ marginBottom: '0.75rem' }}>{description}</p>
      {to && (
        <Button
          as={Link}
          to={to}
          variant="link"
          size="sm"
          className="text-primary text-decoration-none p-0"
          style={{ margin: '0 auto', display: 'inline-block', fontWeight: 600 }}
          onClick={handleButtonClick}
        >
          {linkText} →
        </Button>
      )}
    </Card>
  );
};

export default FeatureCard;
