import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';

const CookieConsentBanner = () => {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
      } catch (e) {
        setShow(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShow(false);
  };

  const handleRejectOptional = () => {
    const prefs = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShow(false);
  };

  const handleCustomize = () => {
    setShowSettings(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowSettings(false);
    setShow(false);
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'essential') return;
    setPreferences({ ...preferences, [name]: checked });
  };

  if (!show && !showSettings) return null;

  return (
    <>
      {/* Banner */}
      {show && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            padding: '1rem 0',
            zIndex: 9999,
            borderTop: '4px solid #0d6efd',
          }}
        >
          <Container>
            <Row className="align-items-center">
              <Col md={7} lg={8}>
                <div className="mb-2 mb-md-0">
                  <strong>🍪 We use cookies</strong>
                  <p className="mb-0 small">
                    We use cookies to improve your experience, remember your preferences, and analyse how you use the platform.
                    You can choose which cookies to allow.
                  </p>
                </div>
              </Col>
              <Col md={5} lg={4} className="d-flex flex-wrap gap-2 justify-content-md-end">
                <Button variant="outline-secondary" size="sm" onClick={handleCustomize}>
                  Customize
                </Button>
                <Button variant="outline-primary" size="sm" onClick={handleRejectOptional}>
                  Reject Optional
                </Button>
                <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                  Accept All
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
      )}

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>🍪 Cookie Preferences</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Choose which cookies you allow. Essential cookies are always required.</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="essential"
                label="🔒 Essential Cookies (required)"
                checked={preferences.essential}
                disabled
              />
              <Form.Text className="text-muted">Login, security, and session management.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="functional"
                label="⚙️ Functional Cookies"
                name="functional"
                checked={preferences.functional}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">Language, theme, and accessibility settings.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="analytics"
                label="📊 Analytics Cookies"
                name="analytics"
                checked={preferences.analytics}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">Anonymous usage tracking to improve the platform.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="marketing"
                label="🚫 Marketing Cookies"
                name="marketing"
                checked={preferences.marketing}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">Currently none. Reserved for future use.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSavePreferences}>Save Preferences</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CookieConsentBanner;