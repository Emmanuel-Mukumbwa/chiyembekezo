import { useState } from 'react';
import { Container, Row, Col, Button, Card, Accordion, Carousel, Badge } from 'react-bootstrap';
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

  // Statistics (static for now – can be dynamic later)
  const stats = [
    { icon: '📖', number: '200+', label: 'Resources' },
    { icon: '🧠', number: '5', label: 'Self-Assessments' },
    { icon: '🫁', number: '8', label: 'Wellness Tools' },
    { icon: '👨‍⚕️', number: '50+', label: 'Professionals' },
  ];

  // Choose Your Journey options
  const journeyCards = [
    { icon: '😊', label: 'I\'m feeling stressed', link: '/wellness/breathing' },
    { icon: '😔', label: 'I\'m feeling depressed', link: '/assessments/phq9' },
    { icon: '😰', label: 'I\'m anxious', link: '/assessments/gad7' },
    { icon: '😴', label: 'I can\'t sleep', link: '/assessments/sleep' },
    { icon: '📚', label: 'I\'m a student', link: '/resources?category=students' },
    { icon: '👨‍👩‍👧', label: 'I\'m supporting someone', link: '/resources?category=parenting' },
    { icon: '💼', label: 'I\'m a professional', link: '/find-help' },
  ];

  // Explore by Need (categories)
  const exploreNeeds = [
    { icon: '🌙', label: 'Better Sleep', link: '/resources?category=sleep' },
    { icon: '😰', label: 'Anxiety', link: '/resources?category=anxiety' },
    { icon: '💔', label: 'Grief', link: '/resources?category=grief' },
    { icon: '🎓', label: 'Exam Stress', link: '/resources?category=students' },
    { icon: '💼', label: 'Workplace Stress', link: '/resources?category=workplace' },
    { icon: '👨‍👩‍👧', label: 'Relationships', link: '/resources?category=relationships' },
    { icon: '💸', label: 'Financial Pressure', link: '/resources?category=financial' },
    { icon: '🌱', label: 'Self-Esteem', link: '/resources?category=self-esteem' },
  ];

  // Features grid (What you can do)
  const features = [
    { icon: '🧠', label: 'Take Assessments', link: '/assessments' },
    { icon: '📖', label: 'Read Resources', link: '/resources' },
    { icon: '📝', label: 'Keep a Journal', link: '/journal' },
    { icon: '😊', label: 'Track Your Mood', link: '/dashboard' },
    { icon: '🫁', label: 'Practice Breathing', link: '/wellness/breathing' },
    { icon: '🧘', label: 'Meditate', link: '/wellness/meditation' },
    { icon: '🎧', label: 'Calming Sounds', link: '/wellness/sounds' },
    { icon: '🤝', label: 'Join Community', link: '/community' },
    { icon: '👨‍⚕️', label: 'Find Professionals', link: '/find-help' },
    { icon: '📅', label: 'Book Appointments', link: '/find-help' },
    { icon: '🎯', label: 'Set Wellness Goals', link: '/goals' },
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
            <Button variant="outline-success" size="lg" as={Link} to="/get-started">
              👋 New Here? Start Here
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

      {/* ===== NEW HERE? SECTION ===== */}
      <Container className="my-5">
        <Row>
          <Col lg={10} className="mx-auto">
            <Card className="feature-card p-4 text-center border-primary">
              <h2 className="mb-3">👋 New to Chiyembekezo?</h2>
              <p className="text-muted mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Not sure where to begin? We've prepared a short guide that explains how the platform works and helps you get started.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Button as={Link} to="/get-started" variant="primary" size="lg">
                  📖 Read the Guide
                </Button>
                <Button as={Link} to="/assessments" variant="outline-primary" size="lg">
                  🩺 Check Your Wellbeing
                </Button>
                <Button as={Link} to="/find-help" variant="outline-success" size="lg">
                  💙 Find Support
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ===== STATISTICS ===== */}
      <Container className="my-5">
        <Row className="justify-content-center">
          {stats.map((s, idx) => (
            <Col key={idx} xs={6} sm={3} className="text-center mb-3">
              <div style={{ fontSize: '2.5rem' }}>{s.icon}</div>
              <h3>{s.number}</h3>
              <div className="text-muted">{s.label}</div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ===== CHOOSE YOUR JOURNEY ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">How can we help today?</h2>
        <Row className="justify-content-center">
          {journeyCards.map((item, idx) => (
            <Col xs={6} sm={4} md={3} key={idx} className="mb-3">
              <Card className="feature-card text-center h-100 p-2">
                <Card.Body>
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <Card.Text className="small">{item.label}</Card.Text>
                  <Button as={Link} to={item.link} variant="outline-primary" size="sm">
                    Explore
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ===== WHAT YOU CAN DO ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">What You Can Do</h2>
        <Row>
          {features.map((f, idx) => (
            <Col xs={6} sm={4} md={3} key={idx} className="mb-3">
              <Button
                as={Link}
                to={f.link}
                variant="outline-secondary"
                className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                style={{ minHeight: '80px' }}
              >
                <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                <div className="small mt-1">{f.label}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ===== HOW CHIYEMBEKEZO WORKS ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">How Chiyembekezo Works</h2>
        <Row className="justify-content-center">
          <Col md={10}>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              {[
                'Create Account',
                'Complete Profile',
                'Take Assessment',
                'Track Mood',
                'Get Recommendations',
                'Improve Daily Wellbeing',
                'Connect With Professionals'
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '50px', height: '50px' }}>
                    {idx + 1}
                  </div>
                  <div className="mt-2 small">{step}</div>
                  {idx < 6 && <div className="text-muted">↓</div>}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>

      {/* ===== QUICK SELF ASSESSMENTS ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Quick Self Assessments</h2>
        <Row className="justify-content-center gap-3">
          {["Depression", "Anxiety", "Stress", "Sleep", "Burnout"].map((test) => (
            <Col xs="auto" key={test}>
              <Button variant="outline-secondary" as={Link} to={`/assessments/${test.toLowerCase()}`}>
                {test} Test
              </Button>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ===== EXPLORE BY NEED ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Explore by Need</h2>
        <Row className="justify-content-center">
          {exploreNeeds.map((item, idx) => (
            <Col xs={6} sm={4} md={3} key={idx} className="mb-3">
              <Card className="feature-card text-center h-100 p-2">
                <Card.Body>
                  <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                  <Card.Text className="small">{item.label}</Card.Text>
                  <Button as={Link} to={item.link} variant="outline-primary" size="sm">
                    Explore
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ===== WELLNESS TOOLKIT PREVIEW ===== */}
      <Container className="my-5 text-center">
        <h2 className="mb-4">🧘 Wellness Toolkit</h2>
        <p className="text-muted mb-4">Take a moment to relax and reset.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button as={Link} to="/wellness/breathing" variant="outline-primary">
            🫁 Breathing
          </Button>
          <Button as={Link} to="/wellness/meditation" variant="outline-primary">
            🧘 Meditation
          </Button>
          <Button as={Link} to="/wellness/grounding" variant="outline-primary">
            🌿 Grounding
          </Button>
          <Button as={Link} to="/wellness/sounds" variant="outline-primary">
            🌧 Relaxation Sounds
          </Button>
          <Button as={Link} to="/wellness" variant="primary">
            Open Toolkit
          </Button>
        </div>
        {/* Breathing preview (optional) */}
        <Card className="feature-card p-3 mt-4 mx-auto" style={{ maxWidth: '400px' }}>
          <h6>Try 60 seconds of calm</h6>
          <div className={`breathing-circle ${getBreathingClass()}`} style={{ width: '120px', height: '120px', margin: '1rem auto' }}></div>
          <p className="small">
            {!isBreathing ? 'Press start to begin' :
              breathPhase === 'inhale' ? 'Inhale...' :
              breathPhase === 'hold1' ? 'Hold...' :
              breathPhase === 'exhale' ? 'Exhale...' :
              'Hold...'
            }
          </p>
          <Button variant="primary" size="sm" onClick={startBreathing} disabled={isBreathing}>
            {isBreathing ? 'Breathing...' : 'Start Exercise'}
          </Button>
        </Card>
      </Container>

      {/* ===== FIND PROFESSIONAL HELP ===== */}
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

      {/* ===== COMMUNITY STORIES ===== */}
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

      {/* ===== WHY TRUST CHIYEMBEKEZO ===== */}
      <Container className="my-5">
        <h2 className="text-center mb-4">🔒 Why People Trust Chiyembekezo</h2>
        <Row className="justify-content-center">
          <Col md={3} sm={6} className="text-center mb-3">
            <div style={{ fontSize: '3rem' }}>🔒</div>
            <h6>Private</h6>
            <p className="small text-muted">Your data is encrypted and never shared.</p>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div style={{ fontSize: '3rem' }}>📚</div>
            <h6>Evidence-informed</h6>
            <p className="small text-muted">Tools based on validated research.</p>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div style={{ fontSize: '3rem' }}>🇲🇼</div>
            <h6>Built for Malawi</h6>
            <p className="small text-muted">Designed with local context in mind.</p>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div style={{ fontSize: '3rem' }}>❤️</div>
            <h6>Compassion-first</h6>
            <p className="small text-muted">Everything we do starts with empathy.</p>
          </Col>
        </Row>
      </Container>

      {/* ===== TESTIMONIALS ===== */}
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

      {/* ===== FAQ ===== */}
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

      {/* ===== BOTTOM CTA ===== */}
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