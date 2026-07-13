import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const soundLibrary = [
  { id: 'rain', name: 'Rain', icon: '🌧', color: '#4a90d9' },
  { id: 'forest', name: 'Forest', icon: '🌲', color: '#2d7d2d' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', color: '#1e6f8f' },
  { id: 'fireplace', name: 'Fireplace', icon: '🔥', color: '#b85a1a' },
  { id: 'night', name: 'Night', icon: '🌙', color: '#2c3e50' },
  { id: 'birds', name: 'Birds', icon: '🐦', color: '#6a9fb5' },
  { id: 'piano', name: 'Piano', icon: '🎹', color: '#8b6b4d' },
  { id: 'whitenoise', name: 'White Noise', icon: '🤍', color: '#a0a0a0' },
];

const Sounds = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  const playSound = (sound) => {
    setSelectedSound(sound);
    setIsPlaying(true);
    if (sleepTimer) {
      setRemaining(sleepTimer * 60);
    }
  };

  const stopSound = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRemaining(0);
  };

  const startSleepTimer = (minutes) => {
    setSleepTimer(minutes);
    setRemaining(minutes * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          showModal('Timer Finished', 'Sound stopped.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <Container className="my-5">
      <h2 className="mb-4">Relaxation Sounds</h2>
      {!selectedSound ? (
        <Row>
          {soundLibrary.map(sound => (
            <Col md={3} sm={6} key={sound.id} className="mb-3">
              <Card
                className="feature-card text-center p-3"
                style={{ cursor: 'pointer' }}
                onClick={() => playSound(sound)}
              >
                <div style={{ fontSize: '3rem' }}>{sound.icon}</div>
                <Card.Title className="mt-2">{sound.name}</Card.Title>
                <Button variant="outline-primary" size="sm">Play</Button>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="feature-card p-4 text-center">
          <div style={{ fontSize: '4rem' }}>{selectedSound.icon}</div>
          <h3>{selectedSound.name}</h3>
          {isPlaying && (
            <>
              <div className="my-3">
                <Form.Label>Volume: {volume}%</Form.Label>
                <Form.Range
                  min="0" max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                />
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="danger" onClick={stopSound}>Stop</Button>
                <Button variant="outline-secondary" onClick={() => setSelectedSound(null)}>Change Sound</Button>
              </div>
              {sleepTimer && (
                <div className="mt-3">
                  <p>Sleep Timer: {formatTime(remaining)}</p>
                  <ProgressBar now={(remaining / (sleepTimer * 60)) * 100} />
                </div>
              )}
              <div className="mt-3">
                <Button variant="outline-primary" size="sm" onClick={() => startSleepTimer(15)}>15 min</Button>
                <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => startSleepTimer(30)}>30 min</Button>
                <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => startSleepTimer(45)}>45 min</Button>
                <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => startSleepTimer(60)}>60 min</Button>
              </div>
            </>
          )}
          {!isPlaying && (
            <Button variant="primary" onClick={() => setIsPlaying(true)}>Resume</Button>
          )}
        </Card>
      )}
      <div className="mt-4">
        <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
      </div>
    </Container>
  );
};

export default Sounds;