import { useState, useEffect } from 'react';
import { Container, Row, Col, Accordion, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  Button,
  Card,
  SectionTitle,
  StatCard,
  FeatureCard,
  EmergencyCard,
  LoadingSkeleton,
} from '../components/ui';
import api from '../services/api';
import '../styles/custom.css';

const Home = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [featuredContacts, setFeaturedContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  // Fetch featured emergency contacts
  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      try {
        const res = await api.get('/professionals/emergency/contacts');
        setFeaturedContacts(res.data.featured || []);
      } catch (err) {
        console.error('Failed to fetch emergency contacts:', err);
      } finally {
        setContactsLoading(false);
      }
    };
    fetchEmergencyContacts();
  }, []);

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

  const stats = [ 
    { icon: '📖', value: '200+', label: 'Resources' },
    { icon: '🧠', value: '5', label: 'Self-Assessments' },
    { icon: '🫁', value: '8', label: 'Wellness Tools' },
    { icon: '👨‍⚕️', value: '50+', label: 'Professionals' },
  ];

  const features = [
    { icon: '🧠', title: 'Assessments', description: 'Take validated self-assessments.', to: '/assessments' },
    { icon: '📖', title: 'Resources', description: 'Read articles and guides.', to: '/resources' },
    { icon: '📝', title: 'Journal', description: 'Write private entries.', to: '/journal' },
    { icon: '😊', title: 'Mood Tracker', description: 'Log your daily mood.', to: '/dashboard' },
    { icon: '🫁', title: 'Breathing', description: 'Practice calming exercises.', to: '/wellness/breathing' },
    { icon: '🧘', title: 'Meditation', description: 'Guided sessions.', to: '/wellness/meditation' },
    { icon: '🎧', title: 'Sounds', description: 'Relax with ambient audio.', to: '/wellness/sounds' },
    { icon: '🤝', title: 'Community', description: 'Join support forums.', to: '/community' },
    { icon: '👨‍⚕️', title: 'Professionals', description: 'Find verified professionals.', to: '/find-help' },
    { icon: '🎯', title: 'Goals', description: 'Set and track wellness goals.', to: '/goals' },
  ];

  const toolkitItems = [
    { icon: '🫁', title: 'Breathing', description: 'Calm your mind.', to: '/wellness/breathing' },
    { icon: '🧘', title: 'Meditation', description: 'Find peace.', to: '/wellness/meditation' },
    { icon: '🌿', title: 'Grounding', description: 'Stay present.', to: '/wellness/grounding' },
    { icon: '🌧', title: 'Sounds', description: 'Relax with audio.', to: '/wellness/sounds' },
    { icon: '⏰', title: 'Timers', description: 'Focus and sleep.', to: '/wellness/timers' },
  ];

  return (
    <main>
      {/* Emergency Banner – fully DB-driven */}
      <Container className="my-4">
        {contactsLoading ? (
          <LoadingSkeleton type="card" lines={3} />
        ) : (
          <EmergencyCard
            title="Need immediate help?"
            description="If you're in crisis, don't face it alone."
            helplines={featuredContacts.map(c => ({ name: c.name, phone: c.phone }))}
            onCall={(phone) => window.location.href = `tel:${phone}`}
            onOpenEmergency={() => window.location.href = '/emergency'}
          />
        )}
      </Container>

      {/* Hero */}
      <section className="hero-section text-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 100%)', padding: '4rem 0' }}>
        <Container>
          <h1 className="display-3 fw-bold" style={{ color: 'var(--color-text)' }}>You Are Not Alone.</h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Taking care of your mental wellbeing starts with small steps. We're here to help.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Button as={Link} to="/assessments" variant="primary" size="lg">
              Take a Free Mental Wellness Check
            </Button>
            <Button as={Link} to="/find-help" variant="outline-primary" size="lg">
              Find Support Near You
            </Button>
            <Button as={Link} to="/get-started" variant="outline-secondary" size="lg">
              👋 New Here? Start Here
            </Button>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <Container className="my-5">
        <Row className="g-4 justify-content-center">
          {stats.map((s, idx) => (
            <Col xs={6} sm={3} key={idx}>
              <StatCard icon={s.icon} value={s.number} label={s.label} className="h-100" />
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <Container className="my-5">
        <SectionTitle title="How Chiyembekezo Works" subtitle="Your journey to better mental health in simple steps." />
        <Row className="justify-content-center">
          <Col md={10}>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {['Create Account', 'Complete Profile', 'Take Assessment', 'Track Mood', 'Get Insights', 'Connect with Professionals'].map((step, idx) => (
                <div key={idx} className="text-center" style={{ width: '110px' }}>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '48px', height: '48px' }}>
                    {idx + 1}
                  </div>
                  <div className="mt-2 small fw-medium">{step}</div>
                  {idx < 5 && <div className="text-muted">↓</div>}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features */}
      <Container className="my-5">
        <SectionTitle title="What You Can Do" subtitle="Explore the tools and resources available to you." />
        <Row className="g-4">
          {features.map((f, idx) => (
            <Col xs={6} sm={4} md={3} key={idx}>
              <FeatureCard
                icon={f.icon}
                title={f.title}
                description={f.description}
                to={f.to}
                linkText="Explore"
                className="h-100"
              />
            </Col>
          ))}
        </Row>
      </Container>

      {/* Wellness Toolkit Preview */}
      <Container className="my-5">
        <SectionTitle title="🧘 Wellness Toolkit" subtitle="Take a moment to relax and reset." />
        <Row className="g-4 justify-content-center">
          {toolkitItems.map((item, idx) => (
            <Col xs={6} sm={4} md={3} key={idx}>
              <FeatureCard
                icon={item.icon}
                title={item.title}
                description={item.description}
                to={item.to}
                linkText="Open"
                className="h-100"
              />
            </Col>
          ))}
        </Row>
        {/* Breathing preview */}
        <Card className="mx-auto p-4 mt-4" style={{ maxWidth: '400px' }}>
          <h6 className="text-center">Try 60 seconds of calm</h6>
          <div className={`breathing-circle ${getBreathingClass()}`} style={{ width: '100px', height: '100px', margin: '1rem auto', background: 'radial-gradient(circle at 30% 30%, var(--color-primary-400), var(--color-primary-600))' }}></div>
          <p className="text-center small mb-2">
            {!isBreathing ? 'Press start to begin' :
              breathPhase === 'inhale' ? 'Inhale...' :
              breathPhase === 'hold1' ? 'Hold...' :
              breathPhase === 'exhale' ? 'Exhale...' :
              'Hold...'
            }
          </p>
          <Button variant="primary" size="sm" className="w-100" onClick={startBreathing} disabled={isBreathing}>
            {isBreathing ? 'Breathing...' : 'Start Exercise'}
          </Button>
        </Card>
      </Container>

      {/* Find Professional Help */}
      <Container className="my-5">
        <SectionTitle title="Find Professional Help" subtitle="Search for verified mental health professionals in your area." />
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="p-4">
              <Row className="g-2 align-items-end">
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
                  <Button as={Link} to="/find-help" variant="primary" className="w-100">
                    Search
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Community Stories */}
      <Container className="my-5">
        <SectionTitle title="Community Stories" subtitle="Real voices, real hope." />
        <Carousel interval={5000} indicators={false}>
          <Carousel.Item>
            <Card className="text-center p-4 mx-auto" style={{ maxWidth: '600px' }}>
              <blockquote className="blockquote mb-0">
                <p>"I thought I was alone in my struggles. Reading about others' journeys gave me the courage to seek help."</p>
                <footer className="blockquote-footer">Anonymous, Lilongwe</footer>
              </blockquote>
            </Card>
          </Carousel.Item>
          <Carousel.Item>
            <Card className="text-center p-4 mx-auto" style={{ maxWidth: '600px' }}>
              <blockquote className="blockquote mb-0">
                <p>"The breathing exercises and articles helped me manage my anxiety without medication. I'm so grateful."</p>
                <footer className="blockquote-footer">Anonymous, Blantyre</footer>
              </blockquote>
            </Card>
          </Carousel.Item>
        </Carousel>
      </Container>

      {/* Why Trust */}
      <Container className="my-5">
        <SectionTitle title="🔒 Why People Trust Chiyembekezo" />
        <Row className="g-4 justify-content-center">
          {[
            { icon: '🔒', label: 'Private', desc: 'Your data is encrypted and never shared.' },
            { icon: '📚', label: 'Evidence-informed', desc: 'Tools based on validated research.' },
            { icon: '🇲🇼', label: 'Built for Malawi', desc: 'Designed with local context in mind.' },
            { icon: '❤️', label: 'Compassion-first', desc: 'Everything we do starts with empathy.' },
          ].map((item, idx) => (
            <Col xs={6} sm={3} key={idx} className="text-center">
              <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
              <h6 className="mt-2">{item.label}</h6>
              <p className="small text-muted">{item.desc}</p>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Testimonials */}
      <Container className="my-5">
        <SectionTitle title="What Our Users Say" />
        <Row>
          {testimonials.map((t, idx) => (
            <Col md={6} key={idx} className="mb-3">
              <Card className="p-4">
                <p>"{t.text}"</p>
                <footer className="blockquote-footer">{t.name}</footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* FAQ */}
      <Container className="my-5">
        <SectionTitle title="Frequently Asked Questions" />
        <Row className="justify-content-center">
          <Col md={8}>
            <Accordion defaultActiveKey="0">
              {faqs.slice(0, 5).map((faq, idx) => (
                <Accordion.Item eventKey={String(idx)} key={idx}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
            <div className="text-center mt-3">
              <Button as={Link} to="/faq" variant="link">View all FAQs →</Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* CTA */}
      <Container className="text-center my-5 py-4 bg-light rounded-3">
        <h3>Ready to take the next step?</h3>
        <p className="text-muted">Join our community and start your journey toward better mental health.</p>
        <Button as={Link} to="/register" variant="primary" size="lg">
          Create Free Account
        </Button>
      </Container>
    </main>
  );
};

export default Home;
