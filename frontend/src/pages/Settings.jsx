import React, { useState } from 'react';
import { Container, Row, Col, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { usePrompt } from '../hooks/usePrompt';
import {
  Button,
  Card,
  Checkbox,
  Select,
} from '../components/ui';
import LogoutButton from '../components/LogoutButton';

const Settings = () => {
  const { user, logout } = useAuth();
  const { showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    shareAnalytics: true,
  });

  usePrompt(
    () => {
      logout();
      window.location.href = '/login';
    },
    () => {}
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showModal('Success', 'Settings saved successfully.');
      setSuccess(true);
    } catch (err) {
      showModal('Error', 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    showModal(
      'Delete Account',
      'Are you sure you want to delete your account? This action is irreversible.',
      () => {
        showModal('Info', 'Account deletion is not yet implemented.');
      }
    );
  };

  return (
    <Container fluid className="px-0" style={{ overflowX: 'hidden' }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <h2 className="fw-bold">Settings</h2>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Settings saved successfully!
        </Alert>
      )}

      <form onSubmit={handleSave}>
        <Row className="g-3">
          <Col lg={8}>
            <Card className="p-3 p-md-4 mb-4 overflow-hidden">
              <h6 className="fw-bold">General</h6>
              <Row className="g-2">
                <Col md={6}>
                  <Select
                    label="Language"
                    name="language"
                    value={settings.language}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'ch', label: 'Chichewa' },
                      { value: 'tu', label: 'Tumbuka' },
                    ]}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={6}>
                  <Select
                    label="Theme"
                    name="theme"
                    value={settings.theme}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System Default' },
                    ]}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Card>

            <Card className="p-3 p-md-4 mb-4 overflow-hidden">
              <h6 className="fw-bold">Notifications</h6>
              <Checkbox
                label="Email Notifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              <Checkbox
                label="Push Notifications"
                name="pushNotifications"
                checked={settings.pushNotifications}
                onChange={handleChange}
              />
            </Card>

            <Card className="p-3 p-md-4 mb-4 overflow-hidden">
              <h6 className="fw-bold">Privacy</h6>
              <Checkbox
                label="Share anonymous analytics to help improve the platform"
                name="shareAnalytics"
                checked={settings.shareAnalytics}
                onChange={handleChange}
              />
            </Card>

            <Button variant="primary" type="submit" disabled={loading} className="mt-2">
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Col>

          <Col lg={4}>
            <Card className="p-3 p-md-4 border-danger overflow-hidden">
              <h6 className="text-danger">Danger Zone</h6>
              <p className="small text-muted">
                Once you delete your account, all your data will be permanently removed.
              </p>
              <Button variant="outline-danger" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </Card>
          </Col>
        </Row>
      </form>
    </Container>
  );
};

export default Settings;
