import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Card, Button, ErrorState } from '../components/ui';
import api from '../services/api';

const Emergency = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [profileContacts, setProfileContacts] = useState(null);
  const [safetyContacts, setSafetyContacts] = useState(null);
  const [systemContacts, setSystemContacts] = useState({});
  const [featuredContacts, setFeaturedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDistrict, setUserDistrict] = useState('');

  useEffect(() => {
    if (user) {
      fetchEmergencyData();
      fetchUserProfile();
    } else {
      fetchSystemContactsOnly();
    }
  }, [user]);

  const fetchEmergencyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/emergency/data');
      setProfileContacts(res.data.profileContacts);
      setSafetyContacts(res.data.safetyContacts);
      setSystemContacts(res.data.systemContacts || {});
      setFeaturedContacts(res.data.featured || []);
    } catch (err) {
      setError('Failed to load emergency data.');
      showModal('Error', 'Failed to load emergency data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemContactsOnly = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/professionals/emergency/contacts');
      setSystemContacts(res.data.grouped || {});
      setFeaturedContacts(res.data.featured || []);
    } catch (err) {
      setError('Failed to load emergency contacts.');
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
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <ErrorState
          title="Error loading emergency resources"
          description={error}
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 my-4">
      <h1 className="text-center text-danger mb-4">🚨 Emergency Help</h1>

      <Row>
        <Col lg={10} className="mx-auto">
          {/* Emergency Banner – only from featured contacts */}
          <Card
            className="p-4 mb-4 text-center border-danger"
            style={{ backgroundColor: 'var(--color-danger-bg)' }}
          >
            <h2 className="text-danger display-4">Need Immediate Help?</h2>
            <p className="lead">
              If you are in immediate danger, call one of the numbers below or go to your nearest hospital.
            </p>
            {featuredContacts.length > 0 ? (
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {featuredContacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant="danger"
                    size="lg"
                    onClick={() => callNumber(contact.phone)}
                  >
                    📞 {contact.name}
                  </Button>
                ))}
                <Button variant="outline-secondary" size="lg" as="a" href={getMapLink()} target="_blank">
                  📍 Find Nearest Hospital
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-muted">No emergency contacts have been configured.</p>
                <Button variant="outline-secondary" size="lg" as="a" href={getMapLink()} target="_blank">
                  📍 Find Nearest Hospital
                </Button>
              </div>
            )}
          </Card>

          {/* Quick Help Numbers – featured contacts (small buttons) */}
          {featuredContacts.length > 0 && (
            <Card className="p-3 mb-3">
              <h5>📞 Quick Help Numbers</h5>
              <div className="d-flex flex-wrap gap-2">
                {featuredContacts.map((contact) => (
                  <Button
                    key={contact.id}
                    variant="outline-primary"
                    onClick={() => callNumber(contact.phone)}
                  >
                    {contact.name}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* System Emergency Contacts (all contacts by type) */}
          {Object.keys(systemContacts).length > 0 && (
            <div className="mb-4">
              <h4>Support Services</h4>
              {Object.keys(systemContacts).map((type) => (
                <Card key={type} className="p-3 mb-3">
                  <h5 className="text-uppercase text-muted">{type}</h5>
                  <ListGroup variant="flush">
                    {systemContacts[type].map((contact) => (
                      <ListGroup.Item
                        key={contact.id}
                        className="d-flex flex-wrap justify-content-between align-items-center"
                      >
                        <div>
                          <strong>{contact.name}</strong>
                          {contact.organization && (
                            <span className="text-muted"> ({contact.organization})</span>
                          )}
                          {contact.district && <div className="small">{contact.district}</div>}
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => callNumber(contact.phone)}
                        >
                          Call {contact.phone}
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              ))}
            </div>
          )}

          {/* User's Trusted Contact */}
          {user && profileContacts && profileContacts.name && (
            <Card className="p-3 mb-3">
              <h5>👤 Your Trusted Contact</h5>
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <strong>{profileContacts.name}</strong>
                  <div className="small text-muted">{profileContacts.phone}</div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => callNumber(profileContacts.phone)}
                >
                  Call
                </Button>
              </div>
            </Card>
          )}

          {/* Safety Plan Contacts */}
          {user && safetyContacts && (
            <>
              {safetyContacts.trusted_people && (
                <Card className="p-3 mb-3">
                  <h5>👥 People I Trust</h5>
                  <p className="small">{safetyContacts.trusted_people}</p>
                </Card>
              )}
              {safetyContacts.emergency_numbers && (
                <Card className="p-3 mb-3">
                  <h5>📞 Emergency Numbers from Safety Plan</h5>
                  <p className="small">{safetyContacts.emergency_numbers}</p>
                </Card>
              )}
            </>
          )}

          {/* Location Directions */}
          <Card className="p-3 mb-3">
            <h5>📍 Location Directions</h5>
            <p>Find the nearest hospital or clinic in your area.</p>
            <Button variant="primary" as="a" href={getMapLink()} target="_blank">
              Open Maps
            </Button>
            {userDistrict && (
              <div className="mt-2 text-muted small">
                📍 Your district: <strong>{userDistrict}</strong>
              </div>
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
