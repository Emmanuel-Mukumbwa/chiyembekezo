import React from 'react';
import Card from './Card';

const InfoCard = ({ icon, title, value, subtitle, variant = 'default', ...rest }) => {
  const variantColors = {
    default: 'var(--color-primary-50)',
    success: 'var(--color-success-bg)',
    danger: 'var(--color-danger-bg)',
    warning: 'var(--color-warning-bg)',
    info: 'var(--color-info-bg)',
  };
  const bgColor = variantColors[variant] || variantColors.default;

  return (
    <Card className="p-3 text-center" style={{ backgroundColor: bgColor }} {...rest}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <h3 className="fw-bold mb-0">{value}</h3>
      <div className="text-muted small">{title}</div>
      {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
    </Card>
  );
};

export default InfoCard;
