import React from 'react';
import Card from './Card';
import Button from './Button';

const EmergencyCard = ({
  title = 'Need Immediate Help?',
  description = 'If you are in crisis, don\'t face it alone.',
  helplines = [],
  onCall,
  onOpenEmergency,
  ...rest
}) => {
  return (
    <Card
      className="p-3 border-danger d-flex flex-wrap align-items-center justify-content-between"
      style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
        borderWidth: '2px',
      }}
      {...rest}
    >
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span style={{ fontSize: '2rem' }}>🚨</span>
        <div>
          <h6 className="fw-bold text-danger mb-0">{title}</h6>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
        {helplines.map((h, idx) => (
          <Button
            key={idx}
            variant="danger"
            size="sm"
            onClick={() => onCall?.(h.phone)}
            className="shadow-sm"
          >
            📞 {h.name}
          </Button>
        ))}
        {helplines.length === 0 && (
          <>
            <Button variant="danger" size="sm" onClick={() => onCall?.('999')} className="shadow-sm">
              📞 Police
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => onCall?.('116')} className="shadow-sm">
              📞 Child Helpline
            </Button>
          </>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={onOpenEmergency}
          className="shadow"
        >
          Full Emergency →
        </Button>
      </div>
    </Card>
  );
};

export default EmergencyCard;
