import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
    { id: 'introduction', icon: '📖', label: 'Introduction' },
    { id: 'collection', icon: '📊', label: 'Data Collection' },
    { id: 'usage', icon: '🔄', label: 'How We Use Data' },
    { id: 'sharing', icon: '🤝', label: 'Data Sharing' },
    { id: 'security', icon: '🔒', label: 'Data Security' },
    { id: 'rights', icon: '⚖️', label: 'Your Rights' },
    { id: 'cookies', icon: '🍪', label: 'Cookies' },
    { id: 'children', icon: '👶', label: "Children's Privacy" },
    { id: 'changes', icon: '📝', label: 'Changes' },
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
                <Badge bg="light" text="dark" className="me-1">📖 8 min read</Badge>
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
              <h1 className="mb-2">🔒 Privacy Policy</h1>
              <p className="text-muted">
                Last updated: <strong>July 2026</strong>
                {' · '}
                <Badge bg="light" text="dark">8 minute read</Badge>
                {' · '}
                <Badge bg="light" text="dark">Version 1.1</Badge>
              </p>
            </div>

            {/* ⚠ Important Notice */}
            <Card className="border-info p-4 mb-4" style={{ backgroundColor: '#f0f8ff' }}>
              <h5 className="text-info">🔒 Your privacy matters</h5>
              <p className="mb-0">
                We are committed to protecting your data. This policy explains what we collect,
                why we collect it, and how you can control your information.
              </p>
            </Card>

            {/* Plain Language Summary */}
            <Card className="feature-card p-4 mb-4 bg-light">
              <h5>📌 In simple terms</h5>
              <Row>
                <Col md={6}>
                  <ul className="mb-0">
                    <li>✅ We never sell your data</li>
                    <li>✅ Your journal is completely private</li>
                    <li>✅ You can delete your account anytime</li>
                    <li>✅ We use encryption to protect your data</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="mb-0">
                    <li>✅ You control what you share</li>
                    <li>✅ We only collect data needed for the service</li>
                    <li>✅ You can opt out of analytics</li>
                  </ul>
                </Col>
              </Row>
            </Card>

            {/* Sections */}
            <Card id="introduction" className="feature-card p-4 mb-4">
              <h5>📖 1. Introduction</h5>
              <p>
                Chiyembekezo (“we”, “our”, “us”) respects your privacy. This Privacy Policy explains
                how we collect, use, disclose, and protect your personal information when you use our
                platform.
              </p>
              <p>
                By using Chiyembekezo, you consent to the practices described in this policy.
              </p>
            </Card>

            <Card id="collection" className="feature-card p-4 mb-4">
              <h5>📊 2. Information We Collect</h5>
              <h6>a. Information you provide</h6>
              <ul>
                <li>Account details: email, name, phone number, date of birth, gender</li>
                <li>Wellness data: mood entries, journal entries, assessment results, habits, goals</li>
                <li>Profile information: bio, location, emergency contacts</li>
                <li>Communications: messages, support inquiries, feedback</li>
              </ul>
              <h6>b. Information automatically collected</h6>
              <ul>
                <li>Device and browser information (IP address, user agent, operating system)</li>
                <li>Usage data: pages visited, time spent, features used</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </Card>

            <Card id="usage" className="feature-card p-4 mb-4">
              <h5>🔄 3. How We Use Your Information</h5>
              <ul>
                <li>To provide and improve our services</li>
                <li>To personalise your experience and offer recommendations</li>
                <li>To send notifications, reminders, and updates (you can opt out)</li>
                <li>To analyse usage trends and improve the platform</li>
                <li>To ensure safety and prevent abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </Card>

            <Card id="sharing" className="feature-card p-4 mb-4">
              <h5>🤝 4. Data Sharing and Disclosure</h5>
              <p>
                We do not sell your personal data. We may share your data in the following cases:
              </p>
              <ul>
                <li>
                  <strong>With your consent:</strong> e.g., sharing assessment results with a professional.
                </li>
                <li>
                  <strong>For legal reasons:</strong> if required by law or to protect the rights,
                  property, or safety of Chiyembekezo or others.
                </li>
                <li>
                  <strong>With service providers:</strong> we use third‑party services (e.g., hosting,
                  email delivery) that process data on our behalf – they are bound by confidentiality
                  agreements.
                </li>
              </ul>
            </Card>

            <Card id="security" className="feature-card p-4 mb-4">
              <h5>🔒 5. Data Security</h5>
              <p>
                We implement appropriate technical and organisational measures to protect your data
                against unauthorised access, alteration, disclosure, or destruction.
              </p>
              <Row>
                <Col md={6}>
                  <ul>
                    <li>✅ Encryption of data in transit (HTTPS)</li>
                    <li>✅ Secure storage of passwords and sensitive data</li>
                    <li>✅ Regular security assessments</li>
                    <li>✅ Audit logs</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul>
                    <li>✅ Session timeouts</li>
                    <li>✅ Activity monitoring</li>
                    <li>✅ Role-based permissions</li>
                    <li>✅ Database backups</li>
                  </ul>
                </Col>
              </Row>
              <p>
                However, no method of transmission over the internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </Card>

            <Card id="rights" className="feature-card p-4 mb-4">
              <h5>⚖️ 6. Your Rights and Choices</h5>
              <Row>
                <Col md={4} className="mb-2">
                  <Card className="text-center p-2">
                    <div style={{ fontSize: '2rem' }}>📥</div>
                    <strong>Access</strong>
                    <small className="text-muted">Request a copy of your data</small>
                  </Card>
                </Col>
                <Col md={4} className="mb-2">
                  <Card className="text-center p-2">
                    <div style={{ fontSize: '2rem' }}>✏️</div>
                    <strong>Correct</strong>
                    <small className="text-muted">Edit inaccurate information</small>
                  </Card>
                </Col>
                <Col md={4} className="mb-2">
                  <Card className="text-center p-2">
                    <div style={{ fontSize: '2rem' }}>🗑️</div>
                    <strong>Delete</strong>
                    <small className="text-muted">Delete your account and data</small>
                  </Card>
                </Col>
              </Row>
              <p className="mt-3">
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@chiyembekezo.mw">privacy@chiyembekezo.mw</a>.
              </p>
            </Card>

            <Card id="cookies" className="feature-card p-4 mb-4">
              <h5>🍪 7. Cookies</h5>
              <p>
                We use cookies to enhance your experience, remember your preferences, and analyse usage.
                You can control cookie preferences in your browser settings. However, disabling cookies
                may affect some features.
              </p>
            </Card>

            <Card id="children" className="feature-card p-4 mb-4">
              <h5>👶 8. Children’s Privacy</h5>
              <p>
                Chiyembekezo is not intended for children under 13. We do not knowingly collect personal
                data from children under 13. If we become aware that we have collected such data, we will
                delete it promptly.
              </p>
            </Card>

            <Card id="changes" className="feature-card p-4 mb-4">
              <h5>📝 9. Changes to This Policy</h5>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material
                changes via email or a prominent notice on the platform.
              </p>
            </Card>

            <Card id="contact" className="feature-card p-4 mb-4">
              <h5>📞 10. Contact Us</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Privacy:</strong> <a href="mailto:privacy@chiyembekezo.mw">privacy@chiyembekezo.mw</a></p>
                  <p><strong>Support:</strong> <a href="mailto:support@chiyembekezo.mw">support@chiyembekezo.mw</a></p>
                  <p><strong>Phone:</strong> +265 999 123 456</p>
                </Col>
                <Col md={6}>
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
                <span>Updated security practices, added user rights section</span>
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
                <Link to="/terms">📜 Terms & Conditions</Link>
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

export default PrivacyPolicy;