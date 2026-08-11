import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const statusColors = { pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'secondary', 'no-show': 'danger' };

const AppointmentCard = ({ id, patientName, professionalName, scheduledTime, status = 'pending', meetingType, onView, onCancel, onReschedule, ...rest }) => {
  return (
    <Card className="p-3" hoverable="true" {...rest}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="fw-bold mb-1">{patientName || professionalName}</h6>
          <div className="small text-muted">{new Date(scheduledTime).toLocaleString()}</div>
          <div className="small text-muted">{meetingType && `${meetingType} · `}<Badge bg={statusColors[status] || 'secondary'}>{status}</Badge></div>
        </div>
        <div className="d-flex flex-wrap gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => onView?.(id)}>View</Button>
          {status === 'pending' && (
            <>
              <Button variant="outline-secondary" size="sm" onClick={() => onReschedule?.(id)}>📅</Button>
              <Button variant="outline-danger" size="sm" onClick={() => onCancel?.(id)}>Cancel</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCard;
