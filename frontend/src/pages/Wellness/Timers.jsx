import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const Timers = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [timerType, setTimerType] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const intervalRef = useRef(null);

  const presets = {
    pomodoro: { work: 25, break: 5, label: 'Pomodoro' },
    study: { work: 60, break: 10, label: 'Study' },
    focus: { work: 30, break: 5, label: 'Focus' },
    meditation: { work: 10, break: 2, label: 'Meditation' },
    sleep: { work: 30, break: 0, label: 'Sleep' },
  };

  const currentPreset = presets[timerType] || presets.pomodoro;

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          showModal('Timer Finished', 'Time is up!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    const base = isBreak ? currentPreset.break : currentPreset.work;
    setTimeLeft(base * 60);
    setTotalTime(base * 60);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setTimeLeft(currentPreset.work * 60);
    setTotalTime(currentPreset.work * 60);
    setIsRunning(true);
  };

  const startCustom = () => {
    const minutes = Math.max(1, customMinutes);
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
    setIsRunning(true);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (timerType !== 'custom') {
      const base = isBreak ? currentPreset.break : currentPreset.work;
      setTimeLeft(base * 60);
      setTotalTime(base * 60);
    }
  }, [timerType, isBreak]);

  const format = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  return (
    <Container className="my-5">
      <h2 className="mb-4">Relaxation Timers</h2>
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="feature-card p-4">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {Object.keys(presets).map(key => (
                <Button
                  key={key}
                  variant={timerType === key ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => { setTimerType(key); setIsBreak(false); resetTimer(); }}
                >
                  {presets[key].label}
                </Button>
              ))}
              <Form.Control
                type="number"
                placeholder="Custom min"
                className="w-auto d-inline"
                style={{ width: '80px' }}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
              />
              <Button variant="outline-primary" size="sm" onClick={startCustom}>Set</Button>
            </div>

            <div className="text-center my-4">
              <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{format(timeLeft)}</div>
              <div className="text-muted">{isBreak ? 'Break' : timerType !== 'custom' ? presets[timerType]?.label : 'Custom'}</div>
              <ProgressBar now={progress} className="my-3" />
            </div>

            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {!isRunning ? (
                <Button variant="success" onClick={startTimer}>Start</Button>
              ) : (
                <Button variant="warning" onClick={pauseTimer}>Pause</Button>
              )}
              <Button variant="secondary" onClick={resetTimer}>Reset</Button>
              {isBreak && <Button variant="info" onClick={skipBreak}>Skip Break</Button>}
            </div>
          </Card>
        </Col>
      </Row>
      <div className="mt-4 text-center">
        <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
      </div>
    </Container>
  );
};

export default Timers;