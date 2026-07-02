import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '🙂', label: 'Okay', value: 'okay' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😭', label: 'Overwhelmed', value: 'overwhelmed' },
];

const MoodTracker = ({ onSave, compact = false }) => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(0);
  const [water, setWater] = useState(4);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch today's entry if logged in
  useEffect(() => {
    if (user) {
      setLoading(true);
      api.get('/mood/today')
        .then(res => {
          const entry = res.data.entry;
          if (entry) {
            setSelected(entry.mood);
            setNote(entry.notes || '');
            if (!compact) {
              setEnergy(entry.energy || 3);
              setStress(entry.stress || 3);
              setSleep(entry.sleep || 7);
              setExercise(entry.exercise || 0);
              setWater(entry.water || 4);
            }
            // show saved status
            const dt = new Date(entry.created_at || entry.recorded_at);
            setSavedAt(dt.toLocaleString());
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, compact]);

  const handleSave = async () => {
    if (!selected) {
      showModal('Mood Not Selected', 'Please select a mood before saving.');
      return;
    }
    if (!user) {
      showModal('Login Required', 'Please log in to save your mood.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        mood: selected,
        note: note || undefined,
      };
      if (!compact) {
        payload.energy = energy;
        payload.stress = stress;
        payload.sleep = sleep;
        payload.exercise = exercise;
        payload.water = water;
      }
      const res = await api.post('/mood', payload);
      // Update saved time
      const entry = res.data.entry;
      const dt = new Date(entry.created_at || entry.recorded_at);
      setSavedAt(dt.toLocaleString());
      if (onSave) onSave();
      showModal('Success', 'Your mood has been saved!');
    } catch (err) {
      showModal('Error', 'Error saving mood. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-muted">Loading...</div>;

  return (
    <div className="mood-tracker">
      {compact ? (
        // Compact mode: only mood selection + note
        <>
          <h5 className="text-center">How are you feeling today?</h5>
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
          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-100">
            {saving ? 'Saving...' : savedAt ? 'Update Today\'s Mood' : 'Save Mood'}
          </Button>
          {savedAt && <div className="mt-2 text-success small">✓ Saved at {savedAt}</div>}
        </>
      ) : (
        // Full mode: all fields
        <>
          <h5 className="text-center">Today's Wellness Check-in</h5>
          {savedAt && <div className="text-center text-success small">Last updated: {savedAt}</div>}
          <hr />
          <Form.Group className="mb-3">
            <Form.Label>How are you feeling?</Form.Label>
            <div className="d-flex flex-wrap gap-2">
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
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Energy Level (1-5)</Form.Label>
                <Form.Control
                  type="range"
                  min="1" max="5" step="1"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                />
                <div className="text-center">{'⭐'.repeat(energy)}{'☆'.repeat(5-energy)}</div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stress Level (1-5)</Form.Label>
                <Form.Control
                  type="range"
                  min="1" max="5" step="1"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                />
                <div className="text-center">{'😰'.repeat(stress)}{'😌'.repeat(5-stress)}</div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Sleep (hours)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.5"
                  min="0" max="24"
                  value={sleep}
                  onChange={(e) => setSleep(parseFloat(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Exercise (min)</Form.Label>
                <Form.Control
                  type="number"
                  step="5"
                  min="0"
                  value={exercise}
                  onChange={(e) => setExercise(parseInt(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Water (glasses)</Form.Label>
                <Form.Control
                  type="number"
                  step="1"
                  min="0" max="20"
                  value={water}
                  onChange={(e) => setWater(parseInt(e.target.value) || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="How was your day?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSave} disabled={saving} className="w-100">
            {saving ? 'Saving...' : savedAt ? 'Update Today\'s Check-in' : 'Save Today\'s Check-in'}
          </Button>
          {savedAt && <div className="mt-2 text-success text-center small">✓ Saved at {savedAt}</div>}
        </>
      )}
    </div>
  );
};

export default MoodTracker;