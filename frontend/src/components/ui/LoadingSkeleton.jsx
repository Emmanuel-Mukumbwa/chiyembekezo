import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

const LoadingSkeleton = ({
  type = 'card',
  lines = 4,
  withImage = false,
  className = '',
}) => {
  if (type === 'avatar') {
    return (
      <div className={`d-flex gap-3 ${className}`}>
        <Placeholder animation="wave" className="rounded-circle" style={{ width: 60, height: 60 }} />
        <div style={{ flex: 1 }}>
          <Placeholder as="div" animation="wave">
            <Placeholder xs={8} />
          </Placeholder>
          <Placeholder as="div" animation="wave">
            <Placeholder xs={6} />
          </Placeholder>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={className}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="d-flex gap-3 py-2 border-bottom">
            <Placeholder animation="wave" style={{ flex: 1 }}>
              <Placeholder xs={12} />
              <Placeholder xs={8} />
            </Placeholder>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'article') {
    return (
      <div className={className}>
        <Placeholder animation="wave" as="h2">
          <Placeholder xs={10} />
        </Placeholder>
        <Placeholder animation="wave" as="div" className="my-2">
          <Placeholder xs={6} />
        </Placeholder>
        {[...Array(5)].map((_, i) => (
          <Placeholder key={i} animation="wave" as="p">
            <Placeholder xs={12} />
            <Placeholder xs={10} />
          </Placeholder>
        ))}
      </div>
    );
  }

  return (
    <Card className={`bg-surface border-0 shadow-sm rounded-lg ${className}`}>
      {withImage && (
        <Placeholder animation="wave" className="p-3">
          <div style={{ height: '180px', background: 'var(--color-border)', borderRadius: '8px' }} />
        </Placeholder>
      )}
      <Card.Body>
        <Placeholder as={Card.Title} animation="wave" className="mb-2">
          <Placeholder xs={6} />
        </Placeholder>
        {[...Array(lines)].map((_, i) => (
          <Placeholder key={i} as={Card.Text} animation="wave">
            <Placeholder xs={12} />
            <Placeholder xs={10} />
          </Placeholder>
        ))}
        <Placeholder.Button variant="primary" xs={4} disabled />
      </Card.Body>
    </Card>
  );
};

export default LoadingSkeleton;
