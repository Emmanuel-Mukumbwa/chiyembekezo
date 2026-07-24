import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
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
    { id: 'what', icon: '🍪', label: 'What are Cookies?' },
    { id: 'types', icon: '📋', label: 'Types of Cookies' },
    { id: 'why', icon: '🤔', label: 'Why We Use Cookies' },
    { id: 'thirdparty', icon: '🔗', label: 'Third-Party Cookies' },
    { id: 'table', icon: '📊', label: 'Cookie Table' },
    { id: 'manage', icon: '⚙️', label: 'Managing Cookies' },
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
                <Badge bg="light" text="dark" className="me-1">📖 5 min read</Badge>
                <Badge bg="light" text="dark">v1.0</Badge>
              </div>
            </Card>
          </div>
        </Col>

        <Col lg={9}>
          <div ref={contentRef}>
            <div className="mb-4">
              <h1 className="mb-2">🍪 Cookie Policy</h1>
              <p className="text-muted">
                Last updated: <strong>July 2026</strong>
                {' · '}
                <Badge bg="light" text="dark">5 minute read</Badge>
                {' · '}
                <Badge bg="light" text="dark">Version 1.0</Badge>
              </p>
              <p className="lead">
                We use cookies to make Chiyembekezo secure, faster and easier to use.
                You remain in control of your cookie preferences.
              </p>
            </div>

            <Card className="feature-card p-4 mb-4 bg-light">
              <h5>📌 In simple terms</h5>
              <ul className="mb-0">
                <li>✅ We use essential cookies to keep you logged in and secure</li>
                <li>✅ We use optional cookies to remember your preferences and improve the platform</li>
                <li>✅ We never sell your data</li>
                <li>✅ You can change your cookie preferences at any time</li>
              </ul>
            </Card>

            <Card id="what" className="feature-card p-4 mb-4">
              <h5>🍪 1. What are Cookies?</h5>
              <p>
                Cookies are small text files stored on your device when you visit a website.
                They help websites remember things like:
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Badge bg="light" text="dark" className="p-2">✅ Login sessions</Badge>
                <Badge bg="light" text="dark" className="p-2">✅ Preferred language</Badge>
                <Badge bg="light" text="dark" className="p-2">✅ Theme (dark/light)</Badge>
                <Badge bg="light" text="dark" className="p-2">✅ Accessibility settings</Badge>
                <Badge bg="light" text="dark" className="p-2">✅ Recently viewed pages</Badge>
              </div>
            </Card>

            <Card id="types" className="feature-card p-4 mb-4">
              <h5>📋 2. Types of Cookies</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <Card className="h-100 p-3 border-primary">
                    <h6>🔒 Essential Cookies</h6>
                    <p className="small">Required – cannot be disabled</p>
                    <ul className="small mb-0">
                      <li>Login sessions</li>
                      <li>Security tokens</li>
                      <li>Session management</li>
                      <li>Authentication</li>
                    </ul>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 p-3 border-info">
                    <h6>⚙️ Preference Cookies</h6>
                    <p className="small">Remember your choices</p>
                    <ul className="small mb-0">
                      <li>Language preference</li>
                      <li>Theme (dark/light)</li>
                      <li>Accessibility settings</li>
                      <li>Text size</li>
                    </ul>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 p-3 border-success">
                    <h6>📊 Analytics Cookies</h6>
                    <p className="small">Anonymous usage statistics</p>
                    <ul className="small mb-0">
                      <li>Most visited pages</li>
                      <li>Time spent on site</li>
                      <li>Errors</li>
                      <li>Device type</li>
                    </ul>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 p-3 border-secondary">
                    <h6>🚫 Marketing Cookies</h6>
                    <p className="small text-muted">Currently none</p>
                    <p className="small mb-0">
                      Chiyembekezo does not currently use advertising cookies.
                      If we introduce them, we will ask for your explicit consent.
                    </p>
                  </Card>
                </Col>
              </Row>
            </Card>

            <Card id="why" className="feature-card p-4 mb-4">
              <h5>🤔 3. Why We Use Cookies</h5>
              <ul>
                <li><strong>Security:</strong> Keep your account safe and prevent unauthorised access.</li>
                <li><strong>Functionality:</strong> Remember your preferences and make the platform work correctly.</li>
                <li><strong>Performance:</strong> Improve loading speed and overall performance.</li>
                <li><strong>Analytics:</strong> Understand how users interact with the platform to improve it.</li>
              </ul>
            </Card>

            <Card id="thirdparty" className="feature-card p-4 mb-4">
              <h5>🔗 4. Third-Party Cookies</h5>
              <p>We may use trusted third-party services that set their own cookies:</p>
              <ul>
                <li>Google Analytics (for anonymous usage tracking)</li>
                <li>Cloudflare (for security and performance)</li>
                <li>Email service providers (for notifications)</li>
                <li>Hosting providers</li>
              </ul>
              <p className="small text-muted">
                These providers process limited technical information to help operate the platform.
                They are bound by confidentiality agreements.
              </p>
            </Card>

            <Card id="table" className="feature-card p-4 mb-4">
              <h5>📊 5. Cookie Table</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Purpose</th>
                    <th>Required</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>session</code></td>
                    <td>User login and session</td>
                    <td>✅ Yes</td>
                    <td>Until logout</td>
                  </tr>
                  <tr>
                    <td><code>language</code></td>
                    <td>Preferred language</td>
                    <td>❌ No</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><code>theme</code></td>
                    <td>Dark/light mode preference</td>
                    <td>❌ No</td>
                    <td>1 year</td>
                  </tr>
                  <tr>
                    <td><code>analytics</code></td>
                    <td>Anonymous usage tracking</td>
                    <td>❌ No (optional)</td>
                    <td>6 months</td>
                  </tr>
                </tbody>
              </Table>
            </Card>

            <Card id="manage" className="feature-card p-4 mb-4">
              <h5>⚙️ 6. Managing Cookies</h5>
              <p>You can manage your cookie preferences in several ways:</p>
              <ul>
                <li><strong>Cookie Banner:</strong> When you first visit, you can accept all, reject optional, or customize.</li>
                <li><strong>Browser Settings:</strong> You can block or delete cookies in your browser settings.</li>
                <li><strong>Cookie Settings:</strong> You can change your preferences at any time via the link in the footer.</li>
              </ul>
              <p className="text-muted small">
                Note: Disabling essential cookies may affect the functionality of the platform.
              </p>
              <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
                Open Cookie Settings (reload to update consent)
              </Button>
            </Card>

            <Card id="contact" className="feature-card p-4 mb-4">
              <h5>📞 7. Contact Us</h5>
              <p>
                If you have questions about our Cookie Policy, please contact us:
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:privacy@chiyembekezo.mw">privacy@chiyembekezo.mw</a>
                <br />
                <strong>Phone:</strong> +265 999 123 456
              </p>
            </Card>

            <Card className="feature-card p-4">
              <h6>🔗 Related Pages</h6>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/terms">📜 Terms & Conditions</Link>
                <Link to="/privacy-policy">🔒 Privacy Policy</Link>
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

export default CookiePolicy;