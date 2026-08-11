import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const statusColors = { active: 'primary', completed: 'success', archived: 'secondary' };

const GoalCard = ({ id, title, description, progress = 0, status = 'active', targetDate, onEdit, onDelete, onUpdateProgress, ...rest }) => {
  return (
    <Card className="p-3" hoverable="true" {...rest}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="fw-bold mb-1">{title}</h6>
          {description && <p className="small text-muted mb-1">{description}</p>}
          <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>
          {targetDate && <span className="small text-muted ms-2">Due: {new Date(targetDate).toLocaleDateString()}</span>}
        </div>
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => onEdit?.(id)}>✏️</Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete?.(id)}>🗑️</Button>
        </div>
      </div>
      <div className="mt-2">
        <div className="d-flex justify-content-between small"><span>Progress</span><span>{progress}%</span></div>
        <div className="progress" style={{ height: '6px' }}><div className="progress-bar bg-primary" style={{ width: `${progress}%` }} /></div>
      </div>
      {onUpdateProgress && (
        <div className="mt-2 d-flex gap-1">
          <Button variant="outline-secondary" size="sm" onClick={() => onUpdateProgress(id, Math.min(progress + 10, 100))}>+10%</Button>
          <Button variant="outline-success" size="sm" onClick={() => onUpdateProgress(id, 100)}>Complete</Button>
        </div>
      )}
    </Card>
  );
};

export default GoalCard;
