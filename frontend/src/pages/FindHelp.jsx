import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { Button as UIButton, ErrorState, EmergencyCard } from '../components/ui';
import api from '../services/api';

const FindHelp = () => {
  const { showModal } = useModal();
  const [professionals, setProfessionals] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState({});
  const [featuredContacts, setFeaturedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    district: '',
    language: '',
    specialty: '',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [proRes, emergencyRes] = await Promise.all([
        api.get('/professionals', { params: filters }),
        api.get('/professionals/emergency/contacts'),
      ]);
      setProfessionals(proRes.data);
      setEmergencyContacts(emergencyRes.data.grouped || {});
      setFeaturedContacts(emergencyRes.data.featured || []);
    } catch (err) {
      setError('Failed to load data');
      showModal('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', district: '', language: '', specialty: '' });
  };

  const callNumber = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getMapLink = () => {
    return 'https://www.google.com/maps/search/hospital';
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
          title="Error loading data"
          description={error}
          onRetry={fetchData}
        />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Find Mental Health Support</h1>
      <p className="text-center text-muted mb-4">
        Connect with verified professionals, hospitals, and helplines in Malawi.
      </p>

      {/* Emergency Card – fully DB-driven */}
      <EmergencyCard
        title="Need Immediate Help?"
        description="If you are in crisis, call one of the numbers below or go to your nearest hospital."
        helplines={featuredContacts.map(c => ({ name: c.name, phone: c.phone }))}
        onCall={callNumber}
        onOpenEmergency={() => window.location.href = '/emergency'}
        className="mb-4"
      />

      {/* Filters */}
      <Card className="feature-card p-3 mb-4">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Label>Search</Form.Label>
            <Form.Control
              placeholder="Name, clinic, specialty..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>District</Form.Label>
            <Form.Control
              placeholder="e.g., Lilongwe"
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={2}>
            <Form.Label>Language</Form.Label>
            <Form.Select name="language" value={filters.language} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="English">English</option>
              <option value="Chichewa">Chichewa</option>
              <option value="Tumbuka">Tumbuka</option>
              <option value="Yao">Yao</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Specialty</Form.Label>
            <Form.Control
              placeholder="e.g., Anxiety"
              name="specialty"
              value={filters.specialty}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button variant="primary" onClick={fetchData}>Search</Button>
            <Button variant="outline-secondary" onClick={clearFilters}>Clear</Button>
          </Col>
        </Row>
      </Card>

      {/* Professionals List */}
      <h2 className="mb-3">Professionals</h2>
      {professionals.length === 0 ? (
        <p className="text-muted">No professionals found matching your criteria.</p>
      ) : (
        <Row>
          {professionals.map(pro => (
            <Col md={6} lg={4} key={pro.id} className="mb-3">
              <Card className="feature-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div style={{ fontSize: '3rem' }}>👤</div>
                    <div className="ms-3">
                      <h5>{pro.first_name} {pro.last_name}</h5>
                      <div className="text-muted small">{pro.specialization}</div>
                      {pro.is_verified && <Badge bg="success" className="mt-1">Verified</Badge>}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge bg="secondary">{pro.district}</Badge>{' '}
                    <Badge bg="info" text="dark">{pro.languages?.join(', ') || 'N/A'}</Badge>
                  </div>
                  <div className="mt-2 small">
                    <span>⭐ {pro.avg_rating || 'No ratings'}</span>{' '}
                    <span className="text-muted">({pro.completed_sessions} sessions)</span>
                  </div>
                  <div className="mt-2">
                    <span className="small">💰 {pro.consultation_fee ? `MK ${pro.consultation_fee}` : 'Contact for fee'}</span>
                  </div>
                  <Button as={Link} to={`/professional/${pro.id}`} variant="primary" size="sm" className="mt-3">
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Emergency Contacts */}
      <h2 className="mt-5 mb-3">Emergency Contacts & Support</h2>
      <Row>
        {Object.keys(emergencyContacts).length === 0 ? (
          <p className="text-muted">No emergency contacts available.</p>
        ) : (
          Object.keys(emergencyContacts).map(type => (
            <Col md={4} key={type} className="mb-3">
              <Card className="feature-card p-3">
                <h5>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                <ul className="list-unstyled">
                  {emergencyContacts[type].map(contact => (
                    <li key={contact.id} className="mb-2">
                      <strong>{contact.name}</strong>
                      {contact.organization && <div className="text-muted small">{contact.organization}</div>}
                      <div className="small">📞 {contact.phone}</div>
                      {contact.district && <div className="small">{contact.district}</div>}
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default FindHelp;
