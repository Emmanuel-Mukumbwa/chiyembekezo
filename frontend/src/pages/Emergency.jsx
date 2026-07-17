import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Spinner, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Emergency = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [profileContacts, setProfileContacts] = useState(null);
  const [safetyContacts, setSafetyContacts] = useState(null);
  const [systemContacts, setSystemContacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [userDistrict, setUserDistrict] = useState('');

  useEffect(() => {
    if (user) {
      fetchEmergencyData();
      fetchUserProfile();
    } else {
      // If not logged in, still show system contacts
      fetchSystemContactsOnly();
    }
  }, [user]);

  const fetchEmergencyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emergency/data');
      setProfileContacts(res.data.profileContacts);
      setSafetyContacts(res.data.safetyContacts);
      setSystemContacts(res.data.systemContacts || {});
    } catch (err) {
      showModal('Error', 'Failed to load emergency data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemContactsOnly = async () => {
    setLoading(true);
    try {
      const res = await api.get('/professionals/emergency/contacts');
      setSystemContacts(res.data || {});
    } catch (err) {
      showModal('Error', 'Failed to load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.district) {
        setUserDistrict(res.data.district);
      }
    } catch (err) {
      console.error('Failed to fetch user district');
    }
  };

  const callNumber = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getMapLink = () => {
    const query = userDistrict ? `hospital near ${userDistrict}` : 'hospital';
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="text-center text-danger mb-4">🚨 Emergency Help</h1>

      <Row>
        <Col md={10} className="mx-auto">
          {/* BIG RED BUTTON */}
          <Card className="border-danger text-center p-4 mb-4" style={{ backgroundColor: '#fff5f5' }}>
            <h2 className="text-danger display-4">Need Immediate Help?</h2>
            <p className="lead">If you are in immediate danger, call <strong>999</strong> (Police) or go to your nearest hospital.</p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Button variant="danger" size="lg" onClick={() => callNumber('999')}>
                📞 Call 999 – Emergency Services
              </Button>
              <Button variant="outline-danger" size="lg" onClick={() => callNumber('116')}>
                📞 Child Helpline (116)
              </Button>
              <Button variant="outline-secondary" size="lg" as="a" href={getMapLink()} target="_blank">
                📍 Find Nearest Hospital
              </Button>
            </div>
          </Card>

          {/* Quick Help Numbers */}
          <Card className="feature-card p-3 mb-3">
            <h5>📞 Quick Help Numbers</h5>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="outline-primary" onClick={() => callNumber('+265 999 123 456')}>
                Mental Health Helpline
              </Button>
              <Button variant="outline-primary" onClick={() => callNumber('116')}>
                Child Helpline 116
              </Button>
              <Button variant="outline-primary" onClick={() => callNumber('+265 888 123 456')}>
                Domestic Violence Support
              </Button>
            </div>
          </Card>

          {/* System Emergency Contacts */}
          {Object.keys(systemContacts).length > 0 && (
            <div className="mb-4">
              <h4>Support Services</h4>
              {Object.keys(systemContacts).map(type => (
                <Card key={type} className="feature-card p-3 mb-3">
                  <h5 className="text-uppercase text-muted">{type}</h5>
                  <ListGroup variant="flush">
                    {systemContacts[type].map((contact, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{contact.name}</strong>
                          {contact.organization && <span className="text-muted"> ({contact.organization})</span>}
                          {contact.district && <div className="small">{contact.district}</div>}
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => callNumber(contact.phone)}>
                          Call {contact.phone}
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              ))}
            </div>
          )}

          {/* User's Trusted Contacts (from Profile) */}
          {user && profileContacts && profileContacts.name && (
            <Card className="feature-card p-3 mb-3">
              <h5>👤 Your Trusted Contact</h5>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{profileContacts.name}</strong>
                  <div className="small text-muted">{profileContacts.phone}</div>
                </div>
                <Button variant="outline-primary" size="sm" onClick={() => callNumber(profileContacts.phone)}>
                  Call
                </Button>
              </div>
            </Card>
          )}

          {/* Safety Plan Contacts */}
          {user && safetyContacts && (
            <>
              {safetyContacts.trusted_people && (
                <Card className="feature-card p-3 mb-3">
                  <h5>👥 People I Trust</h5>
                  <p className="small">{safetyContacts.trusted_people}</p>
                </Card>
              )}
              {safetyContacts.emergency_numbers && (
                <Card className="feature-card p-3 mb-3">
                  <h5>📞 Emergency Numbers from Safety Plan</h5>
                  <p className="small">{safetyContacts.emergency_numbers}</p>
                </Card>
              )}
            </>
          )}

          {/* Location Directions */}
          <Card className="feature-card p-3 mb-3">
            <h5>📍 Location Directions</h5>
            <p>Find the nearest hospital or clinic in your area.</p>
            <Button variant="primary" as="a" href={getMapLink()} target="_blank">
              Open Maps
            </Button>
            {userDistrict && (
              <div className="mt-2 text-muted small">📍 Your district: <strong>{userDistrict}</strong></div>
            )}
          </Card>

          <div className="text-center mt-4">
            <Button as={Link} to="/" variant="secondary">
              ← Back to Safety
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Emergency;