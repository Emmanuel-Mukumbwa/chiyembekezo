import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { Button, LoadingSkeleton } from '../../components/ui';
import api from '../../services/api';

const Sounds = () => {
  const { showModal } = useModal();
  const [pageLoading, setPageLoading] = useState(true);
  const [sounds, setSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const res = await api.get('/wellness/sounds');
        setSounds(res.data);
      } catch (err) {
        showModal('Error', 'Failed to load sounds.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchSounds();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const playSound = (sound) => {
    setSelectedSound(sound);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = sound.audio_url || '';
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(() => {});
    }
    if (sleepTimer) setRemaining(sleepTimer * 60);
  };

  const stopSound = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setRemaining(0);
  };

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value, 10);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
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
          if (audioRef.current) audioRef.current.pause();
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

  if (pageLoading) {
    return (
      <Container className="my-5">
        <h2 className="mb-4">Relaxation Sounds</h2>
        <Row>
          {[...Array(8)].map((_, i) => (
            <Col md={3} sm={6} key={i} className="mb-3">
              <LoadingSkeleton type="card" lines={3} />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Relaxation Sounds</h2>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {!selectedSound ? (
        <Row>
          {sounds.map(sound => (
            <Col md={3} sm={6} key={sound.id} className="mb-3">
              <Card
                className="feature-card text-center p-3"
                style={{ cursor: 'pointer' }}
                onClick={() => playSound(sound)}
              >
                <div style={{ fontSize: '3rem' }}>{sound.icon || '🎵'}</div>
                <Card.Title className="mt-2">{sound.name}</Card.Title>
                <Button variant="outline-primary" size="sm">Play</Button>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="feature-card p-4 text-center">
          <div style={{ fontSize: '4rem' }}>{selectedSound.icon || '🎵'}</div>
          <h3>{selectedSound.name}</h3>
          {selectedSound.image_url && (
            <img
              src={selectedSound.image_url}
              alt={selectedSound.name}
              style={{ maxWidth: '200px', borderRadius: '8px', margin: '10px auto' }}
            />
          )}
          {isPlaying && (
            <>
              <div className="my-3">
                <Form.Label>Volume: {volume}%</Form.Label>
                <Form.Range min="0" max="100" value={volume} onChange={handleVolumeChange} />
              </div>
              <div className="d-flex justify-content-center gap-2">
                <Button variant="danger" onClick={stopSound}>Stop</Button>
                <Button variant="outline-secondary" onClick={() => setSelectedSound(null)}>
                  Change Sound
                </Button>
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
            <Button variant="primary" onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().catch(() => {});
                setIsPlaying(true);
              }
            }}>Resume</Button>
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
