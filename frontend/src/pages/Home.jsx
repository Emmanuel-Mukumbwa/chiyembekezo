import { useState } from 'react';
import { Container, Row, Col, Button, Card, Accordion, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MoodTracker from '../components/MoodTracker';
import '../styles/custom.css';

const Home = () => {
  const { user } = useAuth();

  // Breathing exercise
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('idle');

  const startBreathing = () => {
    if (isBreathing) return;
    setIsBreathing(true);
    setBreathPhase('inhale');
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold1';
        if (prev === 'hold1') return 'exhale';
        if (prev === 'exhale') return 'hold2';
        return 'inhale';
      });
    }, 4000);
    const timer = setTimeout(() => {
      clearInterval(interval);
      setIsBreathing(false);
      setBreathPhase('idle');
    }, 60000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  };

  const getBreathingClass = () => {
    if (breathPhase === 'inhale' || breathPhase === 'hold1') return 'inhale';
    if (breathPhase === 'exhale' || breathPhase === 'hold2') return 'exhale';
    return '';
  };

  const [showEmergencyBannerModal, setShowEmergencyBannerModal] = useState(false);

  const faqs = [
    { question: "What is Chiyembekezo?", answer: "Chiyembekezo is a digital platform that provides mental wellness resources, self-assessments, and support for people in Malawi. Our goal is to make mental health help accessible and reduce stigma." },
    { question: "Is the platform free?", answer: "Yes, all basic features (articles, assessments, breathing exercises, community reading) are free. Some advanced features like booking professionals or saving progress may require registration." },
    { question: "Is my data private?", answer: "Absolutely. We take privacy very seriously. Your journal entries and mood data are encrypted and only you can access them. We never share your personal information." },
    { question: "Can I use the platform anonymously?", answer: "Yes, you can read resources, take assessments, and even use the AI chat anonymously. Only if you want to save your history or book appointments do you need an account." },
    { question: "What if I need immediate help?", answer: "Click the red 'Emergency' button at the top of every page. It will show you crisis numbers and guidance. You can also call 999 (Police) or visit your nearest hospital." },
  ];

  const testimonials = [
    { name: "Sarah, Lilongwe", text: "Chiyembekezo helped me understand my anxiety. The articles and the mood tracker gave me a sense of control. I finally felt heard." },
    { name: "John, Blantyre", text: "I was hesitant to seek help, but the anonymous community stories inspired me. I'm now seeing a counselor and feeling better every day." },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">You Are Not Alone.</h1>
          <p className="hero-subtitle">
            Taking care of your mental wellbeing starts with small steps. We're here to help.
          </p>
          <div className="mt-4 d-flex flex-wrap justify-content-center gap-3">
            <Button variant="primary" size="lg" as={Link} to="/assessments">
              Take a Free Mental Wellness Check
            </Button>
            <Button variant="outline-primary" size="lg" as={Link} to="/find-help">
              Find Support Near You
            </Button>
          </div>
        </Container>
      </section>

      {/* Emergency Banner */}
      <Container className="my-4">
        <div className="emergency-banner d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <span className="me-2" style={{ fontSize: '2rem' }}>🚨</span>
            <strong>Need immediate help?</strong>
            <span className="d-block d-sm-inline text-muted ms-2">
              If you're in crisis or worried about harming yourself, don't face it alone.
            </span>
          </div>
          <Button variant="danger" onClick={() => setShowEmergencyBannerModal(true)}>
            Get Immediate Help
          </Button>
        </div>
      </Container>

      {/* Emergency Banner Modal */}
      <div
        className="modal fade show"
        style={{ display: showEmergencyBannerModal ? 'block' : 'none', background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setShowEmergencyBannerModal(false)}
      >
        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">🚨 Immediate Help</h5>
              <button type="button" className="btn-close" onClick={() => setShowEmergencyBannerModal(false)}></button>
            </div>
            <div className="modal-body">
              <p className="fw-bold">If you are in immediate danger, call <span className="text-danger">999</span> (Police) or go to your nearest hospital.</p>
              <hr />
              <h6>Trusted Helplines in Malawi</h6>
              <ul className="list-unstyled">
                <li><strong>Mental Health Helpline:</strong> +265 999 123 456</li>
                <li><strong>Child Helpline:</strong> 116 (toll-free)</li>
                <li><strong>Domestic Violence Support:</strong> +265 888 123 456</li>
              </ul>
              <p className="mb-0">Talk to someone you trust. You are not alone.</p>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowEmergencyBannerModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Check-in - compact mode with "Go to Full Check-in" for logged-in users */}
      <Container className="my-5">
        <h2 className="text-center mb-4">How are you feeling today?</h2>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <MoodTracker compact />
            {user && (
              <div className="text-center mt-3">
                <Button as={Link} to="/dashboard" variant="outline-primary" size="sm">
                  Go to Full Check‑in
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Popular Resources */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Popular Resources</h2>
        <Row>
          {[
            "Managing Anxiety", "Understanding Depression", "Exam Stress",
            "Grief", "Relationship Problems", "Burnout", "Financial Stress"
          ].map((topic, idx) => (
            <Col md={3} sm={6} key={idx} className="mb-3">
              <Card className="feature-card">
                <Card.Body>
                  <Card.Title className="h6">{topic}</Card.Title>
                  <Card.Text className="small text-muted">
                    Learn more about {topic.toLowerCase()}.
                  </Card.Text>
                  <Button variant="outline-primary" size="sm" as={Link} to={`/resources?topic=${topic}`}>
                    Read
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Quick Self Assessments - ALL ENABLED with correct links */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Quick Self Assessments</h2>
        <Row className="justify-content-center gap-3">
          <Col xs="auto">
            <Button variant="outline-secondary" as={Link} to="/assessments/phq9">
              Depression Test
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" as={Link} to="/assessments/gad7">
              Anxiety Test
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" as={Link} to="/assessments/stress">
              Stress Test
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" as={Link} to="/assessments/sleep">
              Sleep Test
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-secondary" as={Link} to="/assessments/burnout">
              Burnout Test
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Breathing Exercise */}
      <Container className="my-5 text-center">
        <h2>Take 60 seconds to relax</h2>
        <div className="breathing-circle-container">
          <div className={`breathing-circle ${getBreathingClass()}`}></div>
          <p className="mt-3">
            {!isBreathing ? 'Press start to begin' :
              breathPhase === 'inhale' ? 'Inhale...' :
              breathPhase === 'hold1' ? 'Hold...' :
              breathPhase === 'exhale' ? 'Exhale...' :
              'Hold...'
            }
          </p>
          <Button
            variant="primary"
            onClick={startBreathing}
            disabled={isBreathing}
          >
            {isBreathing ? 'Breathing...' : 'Start Exercise'}
          </Button>
        </div>
      </Container>

      {/* Find Professional Help */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Find Professional Help</h2>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="feature-card p-3">
              <Row>
                <Col sm={4}>
                  <input type="text" className="form-control" placeholder="District" />
                </Col>
                <Col sm={4}>
                  <select className="form-select">
                    <option>All Languages</option>
                    <option>English</option>
                    <option>Chichewa</option>
                    <option>Tumbuka</option>
                  </select>
                </Col>
                <Col sm={4}>
                  <select className="form-select">
                    <option>All Specialties</option>
                    <option>Psychologist</option>
                    <option>Counselor</option>
                    <option>Psychiatrist</option>
                  </select>
                </Col>
              </Row>
              <div className="mt-3 text-center">
                <Button variant="primary" as={Link} to="/find-help">Search for Help</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Community Stories */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Community Stories</h2>
        <Carousel interval={5000} indicators={false}>
          <Carousel.Item>
            <Card className="feature-card text-center p-4 mx-auto" style={{ maxWidth: '600px' }}>
              <Card.Body>
                <blockquote className="blockquote mb-0">
                  <p>"I thought I was alone in my struggles. Reading about others' journeys gave me the courage to seek help."</p>
                  <footer className="blockquote-footer">Anonymous, Lilongwe</footer>
                </blockquote>
              </Card.Body>
            </Card>
          </Carousel.Item>
          <Carousel.Item>
            <Card className="feature-card text-center p-4 mx-auto" style={{ maxWidth: '600px' }}>
              <Card.Body>
                <blockquote className="blockquote mb-0">
                  <p>"The breathing exercises and articles helped me manage my anxiety without medication. I'm so grateful."</p>
                  <footer className="blockquote-footer">Anonymous, Blantyre</footer>
                </blockquote>
              </Card.Body>
            </Card>
          </Carousel.Item>
        </Carousel>
      </Container>

      {/* Testimonials */}
      <Container className="my-5">
        <h2 className="text-center mb-4">What Our Users Say</h2>
        <Row>
          {testimonials.map((t, idx) => (
            <Col md={6} key={idx}>
              <Card className="feature-card p-3 mb-3">
                <Card.Body>
                  <p>"{t.text}"</p>
                  <footer className="blockquote-footer">{t.name}</footer>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* FAQs */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Frequently Asked Questions</h2>
        <Row className="justify-content-center">
          <Col md={8}>
            <Accordion defaultActiveKey="0">
              {faqs.map((faq, idx) => (
                <Accordion.Item eventKey={String(idx)} key={idx}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>

      {/* Bottom CTA */}
      <Container className="text-center my-5 py-4 bg-light rounded-3">
        <h3>Ready to take the next step?</h3>
        <p className="text-muted">Join our community and start your journey toward better mental health.</p>
        <Button variant="primary" size="lg" as={Link} to="/register">
          Create Free Account
        </Button>
      </Container>
    </main>
  );
};

export default Home;