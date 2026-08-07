import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useModal } from '../../context/ModalContext';
import { FaPhone, FaCopy, FaCheck } from 'react-icons/fa';

const EmergencyCard = ({
  title = 'Need Immediate Help?',
  description = 'If you are in crisis, don\'t face it alone.',
  helplines = [],
  onCall,
  onOpenEmergency,
  className = '',
  variant = 'default',
  ...rest
}) => {
  const { showModal } = useModal();
  const [copySuccess, setCopySuccess] = useState(null);

  const handleCall = (phone, name) => {
    showModal(
      `Call ${name}?`,
      `Are you sure you want to call ${name} at ${phone}?`,
      () => {
        if (onCall) {
          onCall(phone);
        } else {
          window.location.href = `tel:${phone}`;
        }
      }
    );
  };

  const copyNumber = (phone, index) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2500);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = phone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(index);
      setTimeout(() => setCopySuccess(null), 2500);
    });
  };

  const padding = variant === 'large' ? 'p-4' : 'p-3';

  return (
    <Card
      className={`border-danger ${padding} text-center ${className}`}
      style={{
        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
        borderWidth: '2px',
      }}
      {...rest}
    >
      <div className="d-flex flex-column align-items-center gap-2">
        <span style={{ fontSize: variant === 'large' ? '2.5rem' : '2rem' }}>🚨</span>
        <div>
          <h5 className={`fw-bold text-danger mb-0 ${variant === 'large' ? 'display-6' : ''}`}>{title}</h5>
          <p className="text-muted small mb-0">{description}</p>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-2">
        {helplines.length > 0 ? (
          helplines.map((h, idx) => (
            <div key={idx} className="d-flex align-items-center gap-1">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleCall(h.phone, h.name)}
                className="d-flex align-items-center gap-1 shadow-sm"
              >
                <FaPhone size={12} /> {h.name}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => copyNumber(h.phone, idx)}
                className="p-1 px-2 d-flex align-items-center gap-1"
                title="Copy number"
                style={{ borderColor: '#dee2e6' }}
              >
                {copySuccess === idx ? <FaCheck size={12} className="text-success" /> : <FaCopy size={12} />}
              </Button>
            </div>
          ))
        ) : (
          <span className="text-muted small me-2">No emergency contacts configured</span>
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
