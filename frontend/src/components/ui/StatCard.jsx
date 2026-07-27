import React from 'react';
import Card from './Card';

const StatCard = ({ icon, value, label, change, changeType = 'neutral', ...rest }) => {
  const changeColors = {
    up: 'var(--color-success)',
    down: 'var(--color-danger)',
    neutral: 'var(--color-text-muted)',
  };
  const changeIcons = { up: '↑', down: '↓', neutral: '→' };

  return (
    <Card
      className="p-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...rest}
    >
      <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</div>
      <h3 className="fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{value}</h3>
      <div className="text-muted small fw-medium" style={{ textAlign: 'center' }}>{label}</div>
      {change && (
        <div className="small mt-1" style={{ color: changeColors[changeType], textAlign: 'center' }}>
          {changeIcons[changeType]} {change}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
