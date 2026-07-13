import React, { useState } from 'react';
import { Container, Card, Button, Form, ProgressBar, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const exercises = {
  '54321': {
    name: '5-4-3-2-1',
    description: 'Engage all five senses to ground yourself.',
    steps: [
      { label: '5 things you can see', placeholder: 'e.g., a tree, a window, a book...' },
      { label: '4 things you can touch', placeholder: 'e.g., the fabric of your shirt, your skin...' },
      { label: '3 things you can hear', placeholder: 'e.g., birds, traffic, your breath...' },
      { label: '2 things you can smell', placeholder: 'e.g., coffee, fresh air...' },
      { label: '1 thing you can taste', placeholder: 'e.g., mint, water, food...' },
    ]
  },
  pmr: {
    name: 'Progressive Muscle Relaxation',
    description: 'Tense and relax each muscle group.',
    steps: [
      { label: 'Feet: tense for 5 seconds, relax', input: false },
      { label: 'Legs: tense for 5 seconds, relax', input: false },
      { label: 'Stomach: tense for 5 seconds, relax', input: false },
      { label: 'Chest: tense for 5 seconds, relax', input: false },
      { label: 'Hands and arms: tense for 5 seconds, relax', input: false },
      { label: 'Shoulders: tense for 5 seconds, relax', input: false },
      { label: 'Face and jaw: tense for 5 seconds, relax', input: false },
    ]
  },
  bodyscan: {
    name: 'Body Scan',
    description: 'Bring awareness to each part of your body.',
    steps: [
      { label: 'Focus on your breath for 3 breaths', input: false },
      { label: 'Notice your feet – any sensations?', input: true, placeholder: 'e.g., warmth, tingling...' },
      { label: 'Notice your legs and hips', input: true, placeholder: 'e.g., tension, relaxation...' },
      { label: 'Notice your stomach and chest', input: true, placeholder: 'e.g., tightness, ease...' },
      { label: 'Notice your hands and arms', input: true, placeholder: 'e.g., heaviness, lightness...' },
      { label: 'Notice your shoulders and neck', input: true, placeholder: 'e.g., stiffness, release...' },
      { label: 'Notice your face and head', input: true, placeholder: 'e.g., tension, calm...' },
    ]
  },
  visualization: {
    name: 'Positive Visualization',
    description: 'Imagine a peaceful place.',
    steps: [
      { label: 'Close your eyes and take 5 deep breaths.', input: false },
      { label: 'Imagine a place where you feel safe and calm.', input: true, placeholder: 'Describe it...' },
      { label: 'What do you see? (colors, shapes, light)', input: true, placeholder: 'e.g., a beach, forest...' },
      { label: 'What sounds do you hear?', input: true, placeholder: 'e.g., waves, birds, silence...' },
      { label: 'What does it feel like? (temperature, breeze)', input: true, placeholder: 'e.g., warm sun, cool breeze...' },
    ]
  },
  safeplace: {
    name: 'Safe Place Exercise',
    description: 'Create a mental safe space.',
    steps: [
      { label: 'Sit comfortably and take 3 slow breaths.', input: false },
      { label: 'Imagine a safe place – anywhere you feel protected.', input: true, placeholder: 'Describe your safe place...' },
      { label: 'Who is there with you? (if anyone)', input: true, placeholder: 'e.g., a loved one, a pet, no one...' },
      { label: 'What makes it safe?', input: true, placeholder: 'e.g., locked door, loving presence...' },
      { label: 'What is the weather or atmosphere like?', input: true, placeholder: 'e.g., sunny, peaceful...' },
    ]
  }
};

const Grounding = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const startExercise = (id) => {
    setSelected(id);
    setStep(0);
    setAnswers([]);
    setCompleted(false);
    setMoodBefore(null);
    setMoodAfter(null);
  };

  const nextStep = (value) => {
    const newAnswers = [...answers];
    newAnswers[step] = value || 'done';
    setAnswers(newAnswers);
    if (step < exercises[selected].steps.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const saveSession = async () => {
    setSaving(true);
    try {
      await api.post('/wellness/grounding/complete', {
        session_name: exercises[selected].name,
        duration_seconds: 120 + step * 30, // approximate
        mood_before: moodBefore,
        mood_after: moodAfter,
      });
      showModal('Success', 'Grounding session saved!');
      setSelected(null);
    } catch (err) {
      showModal('Error', 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  if (!selected) {
    return (
      <Container className="my-5">
        <h2 className="mb-4">Grounding Techniques</h2>
        <p className="text-muted">Choose a technique to reconnect with the present.</p>
        <Row>
          {Object.keys(exercises).map(key => {
            const ex = exercises[key];
            return (
              <Col md={4} key={key} className="mb-3">
                <Card className="feature-card h-100">
                  <Card.Body>
                    <Card.Title>{ex.name}</Card.Title>
                    <Card.Text className="text-muted small">{ex.description}</Card.Text>
                    <Button variant="primary" onClick={() => startExercise(key)}>Start</Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        <div className="mt-4">
          <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
        </div>
      </Container>
    );
  }

  const ex = exercises[selected];
  const currentStep = ex.steps[step];
  const progress = ((step) / ex.steps.length) * 100;

  return (
    <Container className="my-5">
      <Card className="feature-card p-4">
        <h3>{ex.name}</h3>
        {!completed ? (
          <>
            <p className="text-muted">{ex.description}</p>
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="my-3" />
            <p className="fw-bold">{currentStep.label}</p>
            {currentStep.input ? (
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={currentStep.placeholder || 'Enter your response...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    nextStep(e.target.value.trim());
                  }
                }}
                className="mb-3"
              />
            ) : (
              <Button variant="primary" onClick={() => nextStep('')} className="mb-3">
                Next Step
              </Button>
            )}
            <div className="text-muted small">Step {step+1} of {ex.steps.length}</div>
          </>
        ) : (
          <>
            <h5>Great job! 🎉</h5>
            <p>How do you feel now?</p>
            <div className="d-flex flex-wrap gap-2 my-3">
              {[1,2,3,4,5].map(s => (
                <Button
                  key={s}
                  variant={moodAfter === s ? 'primary' : 'outline-secondary'}
                  size="lg"
                  onClick={() => setMoodAfter(s)}
                >
                  {['😭','😔','😐','🙂','😊'][s-1]}
                </Button>
              ))}
            </div>
            <Button
              variant="success"
              onClick={saveSession}
              disabled={!moodAfter || saving}
            >
              {saving ? 'Saving...' : 'Save Session'}
            </Button>
            <Button
              variant="outline-secondary"
              className="ms-2"
              onClick={() => {
                setSelected(null);
                setStep(0);
                setAnswers([]);
                setCompleted(false);
                setMoodBefore(null);
                setMoodAfter(null);
              }}
            >
              Start Over
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Grounding;