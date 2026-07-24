import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Terms = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const windowHeight = scrollHeight - clientHeight;
        const progress = windowHeight > 0 ? (scrollTop / windowHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'acceptance', icon: '📋', label: 'Acceptance' },
    { id: 'accounts', icon: '👤', label: 'Accounts' },
    { id: 'privacy', icon: '🔒', label: 'Privacy' },
    { id: 'community', icon: '💬', label: 'Community Guidelines' },
    { id: 'safety', icon: '⚠️', label: 'Safety & Emergency' },
    { id: 'professionals', icon: '👨‍⚕️', label: 'Professionals' },
    { id: 'ai', icon: '🤖', label: 'AI Disclaimer' },
    { id: 'liability', icon: '⚖️', label: 'Liability' },
    { id: 'termination', icon: '🚫', label: 'Termination' },
    { id: 'contact', icon: '📞', label: 'Contact' },
  ];

  return (
    <Container fluid className="my-5">
      {/* Reading Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: '#e9ecef',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: `${scrollProgress}%`,
            height: '100%',
            backgroundColor: '#0d6efd',
            transition: 'width 0.1s ease',
          }}
        />
      </div>

      <Row>
        {/* Sticky Table of Contents – Desktop */}
        <Col lg={3} className="d-none d-lg-block">
          <div style={{ position: 'sticky', top: '80px' }}>
            <Card className="feature-card p-3">
              <h6 className="mb-3">📖 Contents</h6>
              <nav className="nav flex-column">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="nav-link py-1 px-2"
                    style={{ fontSize: '0.9rem', color: '#1e293b' }}
                  >
                    {section.icon} {section.label}
                  </a>
                ))}
              </nav>
              <hr />
              <div className="small text-muted">
                <Badge bg="light" text="dark" className="me-1">📖 6 min read</Badge>
                <Badge bg="light" text="dark">v1.1</Badge>
              </div>
            </Card>
          </div>
        </Col>

        {/* Main Content */}
        <Col lg={9}>
          <div ref={contentRef}>
            {/* Header */}
            <div className="mb-4">
              <h1 className="mb-2">📜 Terms & Conditions</h1>
              <p className="text-muted">
                Last updated: <strong>July 2026</strong>
                {' · '}
                <Badge bg="light" text="dark">6 minute read</Badge>
                {' · '}
                <Badge bg="light" text="dark">Version 1.1</Badge>
              </p>
            </div>

            {/* ⚠ Important Notice */}
            <Card className="border-danger p-4 mb-4" style={{ backgroundColor: '#fff5f5' }}>
              <h5 className="text-danger">⚠ Important</h5>
              <p className="mb-0">
                Chiyembekezo provides educational, wellness and self-help resources.
                <strong> We are NOT an emergency service.</strong>
                <br />
                If you are in immediate danger, please call emergency services or visit the nearest hospital.
                <br />
                <Button as={Link} to="/emergency" variant="danger" size="sm" className="mt-2">
                  🚨 Emergency Help
                </Button>
              </p>
            </Card>

            {/* Plain Language Summary */}
            <Card className="feature-card p-4 mb-4 bg-light">
              <h5>📌 In simple terms</h5>
              <Row>
                <Col md={6}>
                  <ul className="mb-0">
                    <li>✅ Your journal belongs to you</li>
                    <li>✅ We don't sell your data</li>
                    <li>✅ You can delete your account</li>
                    <li>✅ We use encryption</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="mb-0">
                    <li>✅ Our assessments are not diagnoses</li>
                    <li>✅ We are not an emergency service</li>
                    <li>✅ You control your privacy</li>
                  </ul>
                </Col>
              </Row>
            </Card>

            {/* Sections */}
            <Card id="acceptance" className="feature-card p-4 mb-4">
              <h5>📋 1. Acceptance of Terms</h5>
              <p>
                By using Chiyembekezo (“the Platform”), you agree to these Terms & Conditions.
                If you do not agree, please do not use the Platform.
              </p>
            </Card>

            <Card id="accounts" className="feature-card p-4 mb-4">
              <h5>👤 2. User Accounts</h5>
              <ul>
                <li>You must be at least 13 years old to create an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You agree to provide accurate and complete information.</li>
                <li>You may delete your account at any time via your profile settings.</li>
              </ul>
              <p className="text-muted small">
                <strong>Deleting your account removes:</strong> mood history, journal entries, assessments, habits, goals, and profile information.
                Some information may be retained when required by law.
              </p>
            </Card>

            <Card id="privacy" className="feature-card p-4 mb-4">
              <h5>🔒 3. Privacy & Data Protection</h5>
              <p>
                Your privacy is critically important to us. Please refer to our{' '}
                <Link to="/privacy-policy">Privacy Policy</Link> for detailed information on how we collect,
                use, and protect your personal data.
              </p>
              <p>We protect your data using:</p>
              <Row>
                <Col md={6}>
                  <ul className="small">
                    <li>✅ HTTPS encryption</li>
                    <li>✅ Password hashing</li>
                    <li>✅ Secure authentication</li>
                    <li>✅ Database backups</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="small">
                    <li>✅ Role-based permissions</li>
                    <li>✅ Audit logs</li>
                    <li>✅ Session timeouts</li>
                    <li>✅ Activity monitoring</li>
                  </ul>
                </Col>
              </Row>
            </Card>

            <Card id="community" className="feature-card p-4 mb-4">
              <h5>💬 4. Community Guidelines</h5>
              <p>We encourage:</p>
              <ul>
                <li>✅ Respect</li>
                <li>✅ Empathy</li>
                <li>✅ Listening</li>
                <li>✅ Encouragement</li>
              </ul>
              <p>We prohibit:</p>
              <ul className="text-danger">
                <li>✗ Bullying</li>
                <li>✗ Hate speech</li>
                <li>✗ Medical misinformation</li>
                <li>✗ Self-harm encouragement</li>
                <li>✗ Threats</li>
                <li>✗ Harassment</li>
              </ul>
              <p className="mt-2">
                <strong>Reporting abuse:</strong> If you encounter harmful content, click <strong>Report</strong>.
                Our moderators review reports within 24–48 hours. Repeated violations may result in account suspension.
              </p>
            </Card>

            <Card id="safety" className="feature-card p-4 mb-4 border-danger">
              <h5 className="text-danger">⚠️ 5. Safety & Emergency</h5>
              <p className="fw-bold">
                Chiyembekezo is NOT an emergency service.
              </p>
              <Card className="p-3 mb-2" style={{ backgroundColor: '#fff8f8' }}>
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <strong>🚨 Police:</strong> <span className="fw-bold">999</span>
                  </div>
                  <div>
                    <strong>📞 Child Helpline:</strong> <span className="fw-bold">116</span>
                  </div>
                  <div>
                    <Button as={Link} to="/emergency" variant="danger" size="sm">
                      Open Emergency Resources
                    </Button>
                  </div>
                </div>
              </Card>
              <p>
                If you are experiencing a mental health crisis, or if you or someone else is in immediate danger,
                please call <span className="fw-bold">999</span> (Police) or go to your nearest hospital immediately.
              </p>
            </Card>

            <Card id="professionals" className="feature-card p-4 mb-4">
              <h5>👨‍⚕️ 6. Professional Disclaimer</h5>
              <p>
                Professionals listed on Chiyembekezo operate independently. The platform does not guarantee
                diagnosis, treatment, or outcomes.
              </p>
              <p>
                The self-assessments and information provided are for educational and self-awareness purposes only.
                They are not diagnostic tools and do not constitute medical or psychological advice.
                Always consult a qualified professional for any health concerns.
              </p>
            </Card>

            <Card id="ai" className="feature-card p-4 mb-4">
              <h5>🤖 7. AI Disclaimer</h5>
              <p>
                If you interact with our AI, responses are generated automatically. AI should never replace
                professional medical advice. Always seek professional care for serious concerns.
              </p>
            </Card>

            <Card id="liability" className="feature-card p-4 mb-4">
              <h5>⚖️ 8. Limitation of Liability</h5>
              <p>
                Chiyembekezo is provided “as is” without warranties of any kind. We are not liable for
                any damages arising from your use of the Platform, including but not limited to loss of data,
                emotional distress, or any indirect or consequential damages.
              </p>
              <p className="small text-muted">
                <strong>Governing Law:</strong> These Terms are governed by the laws of Malawi.
                Any disputes shall be resolved in the courts of Malawi.
              </p>
            </Card>

            <Card id="termination" className="feature-card p-4 mb-4">
              <h5>🚫 9. Termination</h5>
              <p>
                We reserve the right to suspend or terminate your account if you violate these Terms.
                You may also terminate your account at any time by contacting us or using the deletion
                option in your profile settings.
              </p>
            </Card>

            <Card id="contact" className="feature-card p-4 mb-4">
              <h5>📞 10. Contact Us</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Legal:</strong> <a href="mailto:legal@chiyembekezo.mw">legal@chiyembekezo.mw</a></p>
                  <p><strong>Privacy:</strong> <a href="mailto:privacy@chiyembekezo.mw">privacy@chiyembekezo.mw</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@chiyembekezo.mw">support@chiyembekezo.mw</a></p>
                </Col>
                <Col md={6}>
                  <p><strong>Phone:</strong> +265 999 123 456</p>
                  <p><strong>Office:</strong> Lilongwe, Malawi</p>
                  <p><strong>Response Time:</strong> Within 48 hours</p>
                </Col>
              </Row>
            </Card>

            {/* Version History */}
            <Card className="feature-card p-4 mb-4">
              <h5>📋 Version History</h5>
              <div className="d-flex justify-content-between border-bottom py-2">
                <span><strong>v1.1</strong></span>
                <span>Updated privacy practices, added community guidelines</span>
                <span className="text-muted">July 2026</span>
              </div>
              <div className="d-flex justify-content-between pt-2">
                <span><strong>v1.0</strong></span>
                <span>Initial release</span>
                <span className="text-muted">July 2026</span>
              </div>
            </Card>

            {/* Related Pages */}
            <Card className="feature-card p-4">
              <h6>🔗 Related Pages</h6>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/privacy-policy">🔒 Privacy Policy</Link>
                <Link to="/cookie-policy">🍪 Cookie Policy</Link>
                <Link to="/community-guidelines">🤝 Community Guidelines</Link>
                <Link to="/emergency">🚨 Emergency Help</Link>
                <Link to="/contact">📞 Contact Us</Link>
              </div>
            </Card>

          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Terms;