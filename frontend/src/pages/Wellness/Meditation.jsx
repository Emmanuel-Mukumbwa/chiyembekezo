import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const Meditation = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [meditations, setMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(null);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);

  useEffect(() => {
    fetchMeditations();
    return () => { if (timer) clearInterval(timer); };
  }, []);

  const fetchMeditations = async () => {
    try {
      const res = await api.get('/wellness/meditations');
      setMeditations(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load meditations.');
    } finally {
      setLoading(false);
    }
  };

  const startMeditation = (med) => {
    setSelected(med);
    setPlaying(true);
    setProgress(0);
    setMoodBefore(null);
    setMoodAfter(null);
    const total = med.duration * 60;
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed++;
      setProgress(Math.min(elapsed / total * 100, 100));
      if (elapsed >= total) {
        clearInterval(interval);
        setPlaying(false);
        setTimer(null);
        showModal('Session Complete', 'Great job! How do you feel now?');
      }
    }, 1000);
    setTimer(interval);
  };

  const stopMeditation = () => {
    if (timer) clearInterval(timer);
    setPlaying(false);
    setTimer(null);
  };

  const saveSession = async () => {
    try {
      await api.post('/wellness/meditation/complete', {
        session_name: selected.title,
        duration_seconds: selected.duration * 60,
        mood_before: moodBefore,
        mood_after: moodAfter,
      });
      showModal('Success', 'Meditation session saved!');
      setSelected(null);
    } catch (err) {
      showModal('Error', 'Failed to save session.');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="my-5">
      <h2>Meditation</h2>
      <Row>
        {!selected ? (
          <>
            {Object.keys(
              meditations.reduce((acc, m) => ({ ...acc, [m.category]: true }), {})
            ).map(cat => (
              <Col md={4} key={cat} className="mb-3">
                <Card className="feature-card">
                  <Card.Body>
                    <Card.Title>{cat}</Card.Title>
                    {meditations.filter(m => m.category === cat).map(m => (
                      <Button
                        key={m.id}
                        variant="outline-primary"
                        size="sm"
                        className="d-block w-100 mb-2"
                        onClick={() => startMeditation(m)}
                      >
                        {m.title} ({m.duration} min)
                      </Button>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </>
        ) : (
          <Col md={8} className="mx-auto">
            <Card className="feature-card p-4 text-center">
              <h3>{selected.title}</h3>
              <p>{selected.duration} min</p>
              {playing && (
                <>
                  <div className="my-3">
                    <div className="progress" style={{ height: '20px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button variant="danger" onClick={stopMeditation}>Stop</Button>
                </>
              )}
              {!playing && selected && (
                <>
                  <div className="my-3">
                    <p>How do you feel before?</p>
                    <div className="d-flex gap-2 justify-content-center">
                      {[1,2,3,4,5].map(s => (
                        <Button key={s} variant={moodBefore === s ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setMoodBefore(s)}>
                          {['😭','😔','😐','🙂','😊'][s-1]}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-3">How do you feel after?</p>
                    <div className="d-flex gap-2 justify-content-center">
                      {[1,2,3,4,5].map(s => (
                        <Button key={s} variant={moodAfter === s ? 'primary' : 'outline-secondary'} size="sm" onClick={() => setMoodAfter(s)}>
                          {['😭','😔','😐','🙂','😊'][s-1]}
                        </Button>
                      ))}
                    </div>
                    <Button variant="success" className="mt-3" onClick={saveSession}>
                      Save Session
                    </Button>
                  </div>
                  <Button variant="outline-secondary" onClick={() => setSelected(null)}>← Back</Button>
                </>
              )}
            </Card>
          </Col>
        )}
      </Row>
      <div className="mt-4">
        <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
      </div>
    </Container>
  );
};

export default Meditation;