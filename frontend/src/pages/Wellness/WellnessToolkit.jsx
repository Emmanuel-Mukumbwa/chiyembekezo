import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const tools = [
  { icon: '🫁', title: 'Breathing Exercises', desc: 'Reduce anxiety and stress.', link: '/wellness/breathing' },
  { icon: '🧘', title: 'Meditation', desc: 'Guided sessions for peace.', link: '/wellness/meditation' },
  { icon: '🌿', title: 'Grounding Techniques', desc: 'Reconnect with the present.', link: '/wellness/grounding' },
  { icon: '🌧', title: 'Relaxation Sounds', desc: 'Rain, forest, ocean, and more.', link: '/wellness/sounds' },
  { icon: '⏰', title: 'Timers', desc: 'Focus, Pomodoro, sleep timers.', link: '/wellness/timers' },
  { icon: '✅', title: 'Daily Wellness', desc: 'Track your daily habits.', link: '/wellness/daily' },
];

const WellnessToolkit = () => {
  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Wellness Toolkit</h1>
      <p className="text-center text-muted mb-5">Take a few minutes for yourself.</p>
      <Row>
        {tools.map((tool, idx) => (
          <Col md={4} lg={3} key={idx} className="mb-4">
            <Card className="feature-card text-center h-100 p-3">
              <div style={{ fontSize: '4rem' }}>{tool.icon}</div>
              <Card.Title className="mt-2">{tool.title}</Card.Title>
              <Card.Text className="text-muted small">{tool.desc}</Card.Text>
              <Button as={Link} to={tool.link} variant="outline-primary">
                Open
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="text-center mt-4">
        <Button as={Link} to="/dashboard" variant="secondary">← Back to Dashboard</Button>
      </div>
    </Container>
  );
};

export default WellnessToolkit;