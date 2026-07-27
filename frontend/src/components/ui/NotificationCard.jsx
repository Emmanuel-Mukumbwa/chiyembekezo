import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const NotificationCard = ({ id, icon, title, message, time, isRead = false, type = 'info', onMarkRead, onDismiss, ...rest }) => {
  const typeColors = { info: 'var(--color-info-bg)', success: 'var(--color-success-bg)', warning: 'var(--color-warning-bg)', danger: 'var(--color-danger-bg)' };
  const bgColor = typeColors[type] || typeColors.info;
  return (
    <Card className={`p-3 ${isRead ? 'opacity-75' : ''}`} style={{ backgroundColor: bgColor }} {...rest}>
      <div className="d-flex gap-3 align-items-start">
        <div style={{ fontSize: '1.5rem' }}>{icon || '📢'}</div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">{title}</h6>
            {!isRead && <Badge bg="primary">New</Badge>}
          </div>
          <p className="small mb-1">{message}</p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">{new Date(time).toLocaleString()}</span>
            <div className="d-flex gap-1">
              {!isRead && <Button variant="outline-primary" size="sm" onClick={() => onMarkRead?.(id)}>Mark Read</Button>}
              <Button variant="outline-secondary" size="sm" onClick={() => onDismiss?.(id)}>✕</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCard;
