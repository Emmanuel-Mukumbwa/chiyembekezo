import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const ProfessionalCard = ({ id, name, specialization, district, languages = [], rating, sessions, fee, isVerified, photo, onViewProfile, ...rest }) => {
  return (
    <Card className="h-100 p-3" hoverable {...rest}>
      <div className="d-flex align-items-center gap-3">
        <div style={{ fontSize: '3rem' }}>{photo || '👤'}</div>
        <div className="flex-grow-1">
          <h6 className="fw-bold mb-0">{name}</h6>
          <div className="small text-muted">{specialization}</div>
        </div>
        {isVerified && <Badge bg="success">✓ Verified</Badge>}
      </div>
      <div className="mt-2 d-flex flex-wrap gap-1">
        <Badge bg="secondary" className="small">{district}</Badge>
        {languages.slice(0, 2).map((lang, idx) => (
          <Badge key={idx} bg="info" text="dark" className="small">{lang}</Badge>
        ))}
        {languages.length > 2 && <Badge bg="light" text="dark" className="small">+{languages.length - 2}</Badge>}
      </div>
      <div className="mt-2 d-flex justify-content-between small">
        <span>⭐ {rating || 'No ratings'}</span>
        <span className="text-muted">{sessions || 0} sessions</span>
        <span className="fw-semibold">{fee ? `MK ${fee}` : 'Contact'}</span>
      </div>
      <Button variant="primary" size="sm" className="mt-2 w-100" onClick={() => onViewProfile?.(id)}>
        View Profile
      </Button>
    </Card>
  );
};

export default ProfessionalCard;
