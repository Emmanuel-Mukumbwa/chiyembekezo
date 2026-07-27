import React from 'react';
import { Card as BsCard } from 'react-bootstrap';

const Card = ({ children, className = '', variant = 'elevated', ...rest }) => {
  const variants = {
    flat: 'bg-surface border-0 shadow-none',
    elevated: 'bg-surface border-0 shadow-sm',
    outlined: 'bg-surface border shadow-none',
    interactive: 'bg-surface border-0 shadow-sm hover-lift',
  };
  const variantClass = variants[variant] || variants.elevated;
  return (
    <BsCard
      className={`rounded-lg ${variantClass} ${className}`}
      style={{ backgroundColor: 'var(--color-surface)' }}
      {...rest}
    >
      {children}
    </BsCard>
  );
};

export default Card;
