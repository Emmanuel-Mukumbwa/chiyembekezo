import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const Breathing = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [technique, setTechnique] = useState('box');
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [cycle, setCycle] = useState(0);
  const [totalCycles, setTotalCycles] = useState(10);
  const [remaining, setRemaining] = useState(0);
  const [duration, setDuration] = useState(0);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  // Technique settings
  const techniques = {
    box: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, hold2: 4 },
    '478': { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, hold2: 0 },
    deep: { name: 'Deep Breathing', inhale: 5, hold: 0, exhale: 5, hold2: 0 },
    calm: { name: 'Calm Breathing', inhale: 6, hold: 0, exhale: 6, hold2: 0 },
  };

  const settings = techniques[technique] || techniques.box;
  const phases = ['inhale', 'hold', 'exhale', 'hold2'];
  const phaseLabels = { inhale: 'Breathe In', hold: 'Hold', exhale: 'Exhale', hold2: 'Hold' };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startBreathing = () => {
    if (!user) {
      showModal('Login Required', 'Please log in to track your sessions.');
      return;
    }
    setCompleted(false);
    setIsRunning(true);
    setPhase('inhale');
    setCycle(0);
    setRemaining(totalCycles);
    setDuration(0);
    setMoodBefore(null);
    setMoodAfter(null);

    let currentCycle = 0;
    let currentPhaseIndex = 0;
    let remainingCycles = totalCycles;

    const runCycle = () => {
      if (currentCycle >= totalCycles) {
        finishBreathing();
        return;
      }

      const phaseName = phases[currentPhaseIndex];
      const seconds = settings[phaseName] || 0;
      setPhase(phaseName);

      if (seconds > 0) {
        let count = seconds;
        const countdown = setInterval(() => {
          count--;
          setDuration(d => d + 1);
          if (count <= 0) {
            clearInterval(countdown);
            currentPhaseIndex++;
            if (currentPhaseIndex >= phases.length) {
              currentPhaseIndex = 0;
              currentCycle++;
              setCycle(currentCycle);
              remainingCycles--;
              setRemaining(remainingCycles);
              if (currentCycle >= totalCycles) {
                finishBreathing();
                return;
              }
            }
            // Continue to next phase
            runCycle();
          }
        }, 1000);
        intervalRef.current = countdown;
      } else {
        // skip phase
        currentPhaseIndex++;
        if (currentPhaseIndex >= phases.length) {
          currentPhaseIndex = 0;
          currentCycle++;
          setCycle(currentCycle);
          remainingCycles--;
          setRemaining(remainingCycles);
          if (currentCycle >= totalCycles) {
            finishBreathing();
            return;
          }
        }
        runCycle();
      }
    };

    runCycle();
  };

  const finishBreathing = () => {
    setIsRunning(false);
    setPhase('idle');
    setCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const saveSession = async () => {
    try {
      await api.post('/wellness/breathing/complete', {
        session_name: techniques[technique].name,
        duration_seconds: duration,
        mood_before: moodBefore,
        mood_after: moodAfter,
      });
      showModal('Success', 'Breathing session saved!');
      navigate('/wellness');
    } catch (err) {
      showModal('Error', 'Failed to save session.');
    }
  };

  return (
    <Container className="my-5">
      <h2>Breathing Exercises</h2>
      <Row>
        <Col lg={7}>
          <Card className="feature-card p-4">
            <h5>Choose Technique</h5>
            <Form.Select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="mb-3"
              disabled={isRunning || completed}
            >
              {Object.keys(techniques).map(key => (
                <option key={key} value={key}>{techniques[key].name}</option>
              ))}
            </Form.Select>

            <div className="text-center my-4">
              <div
                className="breathing-circle"
                style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: isRunning ? '#3b82f6' : '#e0e7ff',
                  transition: 'transform 1s ease-in-out',
                  transform: phase === 'inhale' ? 'scale(1.3)' :
                             phase === 'hold' || phase === 'hold2' ? 'scale(1.1)' :
                             phase === 'exhale' ? 'scale(0.7)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                }}
              >
                {isRunning ? phaseLabels[phase] : 'Start'}
              </div>
            </div>

            <div className="d-flex justify-content-between small text-muted">
              <span>Cycle {cycle} / {totalCycles}</span>
              <span>Remaining: {remaining}</span>
              <span>Duration: {duration}s</span>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Button
                variant="primary"
                onClick={startBreathing}
                disabled={isRunning || completed}
              >
                {isRunning ? 'Running...' : 'Start'}
              </Button>
              <Button
                variant="warning"
                onClick={() => { setIsRunning(false); setPhase('idle'); }}
                disabled={!isRunning}
              >
                Pause
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setIsRunning(false); setPhase('idle'); setCycle(0); setRemaining(totalCycles); setDuration(0); setCompleted(false); }}
                disabled={!isRunning && !completed}
              >
                Restart
              </Button>
            </div>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="feature-card p-3">
            <h6>How do you feel?</h6>
            <div className="d-flex gap-2 mb-3">
              {[1,2,3,4,5].map(score => (
                <Button
                  key={score}
                  variant={moodBefore === score ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setMoodBefore(score)}
                  disabled={completed}
                >
                  {['😭','😔','😐','🙂','😊'][score-1]}
                </Button>
              ))}
            </div>
            {completed && (
              <>
                <h6>After session</h6>
                <div className="d-flex gap-2 mb-3">
                  {[1,2,3,4,5].map(score => (
                    <Button
                      key={score}
                      variant={moodAfter === score ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => setMoodAfter(score)}
                    >
                      {['😭','😔','😐','🙂','😊'][score-1]}
                    </Button>
                  ))}
                </div>
                <Button variant="success" onClick={saveSession}>Save Session</Button>
              </>
            )}
          </Card>
          <div className="mt-3">
            <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Breathing;