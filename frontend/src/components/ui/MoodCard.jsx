import React from 'react';
import Card from './Card';
import Button from './Button';

const moodEmojis = { 5: '😊', 4: '🙂', 3: '😐', 2: '😔', 1: '😭' };
const moodLabels = { 5: 'Happy', 4: 'Okay', 3: 'Neutral', 2: 'Sad', 1: 'Overwhelmed' };

const MoodCard = ({ moodScore, date, note, energy, stress, sleep, exercise, water, onEdit, ...rest }) => {
  return (
    <Card className="p-3" hoverable="true" {...rest}>
      <div className="d-flex align-items-center gap-3">
        <div style={{ fontSize: '3rem' }}>{moodEmojis[moodScore] || '😐'}</div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between">
            <h6 className="fw-bold mb-0">{moodLabels[moodScore] || 'Neutral'}</h6>
            <span className="text-muted small">{date ? new Date(date).toLocaleDateString() : ''}</span>
          </div>
          {note && <p className="small text-muted mb-1">{note}</p>}
          <div className="d-flex flex-wrap gap-3 small text-muted">
            {energy && <span>⚡ {energy}/5</span>}
            {stress && <span>😰 {stress}/5</span>}
            {sleep && <span>😴 {sleep}h</span>}
            {exercise && <span>🏃 {exercise}min</span>}
            {water && <span>💧 {water} glasses</span>}
          </div>
        </div>
        {onEdit && <Button variant="outline-primary" size="sm" onClick={onEdit}>✏️</Button>}
      </div>
    </Card>
  );
};

export default MoodCard;
