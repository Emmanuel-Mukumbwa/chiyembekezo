import React from 'react';
import { Badge } from 'react-bootstrap';
import Card from './Card';
import Button from './Button';

const moodEmojis = { 1: '😭', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };

const JournalCard = ({ id, title, content, moodAtEntry, date, wordCount, isFavorite, entryType = 'free', onEdit, onDelete, onToggleFavorite, ...rest }) => {
  const typeLabels = { free: 'Free', guided: 'Guided', gratitude: 'Gratitude' };
  return (
    <Card className="p-3" hoverable {...rest}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="fw-bold mb-1">{title || 'Untitled'}</h6>
          <div className="d-flex flex-wrap gap-1 mb-1">
            {moodAtEntry && <span>{moodEmojis[moodAtEntry]}</span>}
            <Badge bg="secondary" className="small">{typeLabels[entryType] || entryType}</Badge>
            {isFavorite && <Badge bg="warning" className="small">⭐ Favorite</Badge>}
          </div>
        </div>
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => onEdit?.(id)}>✏️</Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete?.(id)}>🗑️</Button>
          <Button variant="outline-warning" size="sm" onClick={() => onToggleFavorite?.(id)}>
            {isFavorite ? '⭐' : '☆'}
          </Button>
        </div>
      </div>
      <p className="small text-muted mb-1">{content?.substring(0, 100)}...</p>
      <div className="d-flex justify-content-between small text-muted">
        <span>{date ? new Date(date).toLocaleDateString() : ''}</span>
        <span>{wordCount || 0} words</span>
      </div>
    </Card>
  );
};

export default JournalCard;
