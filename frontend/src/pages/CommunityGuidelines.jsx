import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CommunityGuidelines = () => {
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
    { id: 'values', icon: '❤️', label: 'Our Values' },
    { id: 'expect', icon: '✅', label: 'Expected Behaviour' },
    { id: 'unacceptable', icon: '🚫', label: 'Unacceptable Behaviour' },
    { id: 'anonymous', icon: '🕵️', label: 'Anonymous Posting' },
    { id: 'advice', icon: '💡', label: 'Advice Disclaimer' },
    { id: 'crisis', icon: '⚠️', label: 'Crisis Behaviour' },
    { id: 'reporting', icon: '📢', label: 'Reporting System' },
    { id: 'moderation', icon: '🛡️', label: 'Moderation Process' },
    { id: 'appeals', icon: '⚖️', label: 'Appeals' },
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
                <Badge bg="light" text="dark" className="me-1">📖 7 min read</Badge>
                <Badge bg="light" text="dark">v1.0</Badge>
              </div>
            </Card>
          </div>
        </Col>

        <Col lg={9}>
          <div ref={contentRef}>
            <div className="mb-4">
              <h1 className="mb-2">🤝 Community Guidelines</h1>
              <p className="text-muted">
                Last updated: <strong>July 2026</strong>
                {' · '}
                <Badge bg="light" text="dark">7 minute read</Badge>
                {' · '}
                <Badge bg="light" text="dark">Version 1.0</Badge>
              </p>
              <p className="lead">
                Together we create a respectful, supportive and safe community.
                <br />
                <strong>Kindness comes first.</strong>
              </p>
            </div>

            <Card className="feature-card p-4 mb-4 bg-light">
              <h5>💙 Our Promise</h5>
              <p className="mb-0">
                Every person deserves to feel <strong>safe</strong>, <strong>heard</strong>,
                <strong>respected</strong>, and <strong>supported</strong> in our community.
              </p>
            </Card>

            <Card id="values" className="feature-card p-4 mb-4">
              <h5>❤️ 1. Our Values</h5>
              <Row>
                {[
                  { icon: '❤️', label: 'Compassion' },
                  { icon: '🤝', label: 'Respect' },
                  { icon: '🧠', label: 'Understanding' },
                  { icon: '🌍', label: 'Inclusivity' },
                  { icon: '🔒', label: 'Privacy' },
                  { icon: '💬', label: 'Honesty' },
                ].map((item, idx) => (
                  <Col xs={4} sm={4} md={2} key={idx} className="text-center mb-3">
                    <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
                    <div className="small">{item.label}</div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card id="expect" className="feature-card p-4 mb-4">
              <h5>✅ 2. Expected Behaviour</h5>
              <ul>
                <li>Be respectful to everyone</li>
                <li>Listen actively to others</li>
                <li>Support others without judgment</li>
                <li>Respect privacy and confidentiality</li>
                <li>Share experiences honestly and thoughtfully</li>
                <li>Report harmful content when you see it</li>
              </ul>
            </Card>

            <Card id="unacceptable" className="feature-card p-4 mb-4 border-danger">
              <h5 className="text-danger">🚫 3. Unacceptable Behaviour</h5>
              <p>The following behaviours are strictly prohibited:</p>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="danger" className="p-2">Bullying</Badge>
                <Badge bg="danger" className="p-2">Harassment</Badge>
                <Badge bg="danger" className="p-2">Threats</Badge>
                <Badge bg="danger" className="p-2">Discrimination</Badge>
                <Badge bg="danger" className="p-2">Medical misinformation</Badge>
                <Badge bg="danger" className="p-2">Spam</Badge>
                <Badge bg="danger" className="p-2">Sexual harassment</Badge>
                <Badge bg="danger" className="p-2">Scams</Badge>
                <Badge bg="danger" className="p-2">Encouraging suicide</Badge>
                <Badge bg="danger" className="p-2">Encouraging self-harm</Badge>
                <Badge bg="danger" className="p-2">Violence</Badge>
                <Badge bg="danger" className="p-2">Sharing private information</Badge>
              </div>
            </Card>

            <Card id="anonymous" className="feature-card p-4 mb-4">
              <h5>🕵️ 4. Anonymous Posting</h5>
              <p>
                Anonymous posting protects your identity. However, it does <strong>not</strong> protect abuse.
                Moderators can still investigate rule violations. We encourage you to use anonymity responsibly.
              </p>
            </Card>

            <Card id="advice" className="feature-card p-4 mb-4">
              <h5>💡 5. Advice Disclaimer</h5>
              <p>
                Community advice is personal opinion. It should <strong>never</strong> replace
                professional medical advice. Always consult a qualified professional for health concerns.
              </p>
            </Card>

            <Card id="crisis" className="feature-card p-4 mb-4 border-warning">
              <h5>⚠️ 6. Crisis Behaviour</h5>
              <p>If someone appears to be at immediate risk:</p>
              <ul>
                <li>Report the post</li>
                <li>Notify moderation</li>
                <li>Encourage emergency help</li>
                <li>Avoid arguing</li>
                <li>Avoid making promises you cannot keep</li>
              </ul>
              <Button as={Link} to="/emergency" variant="danger" size="sm" className="mt-2">
                🚨 Emergency Resources
              </Button>
            </Card>

            <Card id="reporting" className="feature-card p-4 mb-4">
              <h5>📢 7. Reporting System</h5>
              <p>If you encounter harmful content, click <strong>Report</strong> on the post or comment.</p>
              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Report →</span>
                  <span>Moderator Reviews →</span>
                  <span>Action Taken →</span>
                  <span>Reporter Notified</span>
                </div>
              </div>
              <p className="mt-2">Moderators review reports within 24–48 hours.</p>
            </Card>

            <Card id="moderation" className="feature-card p-4 mb-4">
              <h5>🛡️ 8. Moderation Process</h5>
              <h6>Moderation Levels:</h6>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="secondary" className="p-2">Reminder</Badge>
                <Badge bg="warning" className="p-2">Warning</Badge>
                <Badge bg="danger" className="p-2">Temporary Suspension</Badge>
                <Badge bg="dark" className="p-2">Permanent Ban</Badge>
              </div>
              <h6 className="mt-3">Possible Actions:</h6>
              <ul>
                <li>Content Removed</li>
                <li>Comment Hidden</li>
                <li>Warning Issued</li>
                <li>Account Suspended</li>
                <li>Account Banned</li>
              </ul>
              <p className="text-muted small">
                Moderators remain impartial, respect confidentiality, and protect vulnerable users.
              </p>
            </Card>

            <Card id="appeals" className="feature-card p-4 mb-4">
              <h5>⚖️ 9. Appeals</h5>
              <p>If you believe a moderation decision was made in error, you can appeal:</p>
              <ol>
                <li>Received Warning / Suspension</li>
                <li>Submit an appeal via <a href="mailto:support@chiyembekezo.mw">support@chiyembekezo.mw</a></li>
                <li>Moderator Review</li>
                <li>Final Decision</li>
              </ol>
            </Card>

            <Card id="contact" className="feature-card p-4 mb-4">
              <h5>📞 10. Contact Us</h5>
              <p>
                If you have questions about our Community Guidelines, please contact us:
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:support@chiyembekezo.mw">support@chiyembekezo.mw</a>
                <br />
                <strong>Phone:</strong> +265 999 123 456
              </p>
            </Card>

            <Card className="feature-card p-4">
              <h6>🔗 Related Pages</h6>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/terms">📜 Terms & Conditions</Link>
                <Link to="/privacy-policy">🔒 Privacy Policy</Link>
                <Link to="/cookie-policy">🍪 Cookie Policy</Link>
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

export default CommunityGuidelines;