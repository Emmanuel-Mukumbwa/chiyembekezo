import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '🙂', label: 'Okay', value: 'okay' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😭', label: 'Overwhelmed', value: 'overwhelmed' },
];

const MoodTracker = ({ onSave }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!selected) {
      setMessage('Please select a mood.');
      return;
    }
    if (!user) {
      setMessage('Please log in to save your mood.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/mood', {
        userId: user.id,
        mood: selected,
        note: note || undefined,
      });
      setMessage('Mood saved!');
      if (onSave) onSave();
    } catch (err) {
      setMessage('Error saving mood. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mood-tracker text-center">
      <h5>How are you feeling today?</h5>
      <div className="d-flex justify-content-center flex-wrap gap-2 my-3">
        {moods.map((m) => (
          <div
            key={m.value}
            className={`mood-option ${selected === m.value ? 'selected' : ''}`}
            onClick={() => setSelected(m.value)}
            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
          >
            <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
            <div className="small">{m.label}</div>
          </div>
        ))}
      </div>
      <Form.Group className="mb-2">
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Mood'}
      </Button>
      {message && <div className="mt-2 text-muted small">{message}</div>}
    </div>
  );
};

export default MoodTracker;