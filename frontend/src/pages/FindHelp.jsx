import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const FindHelp = () => {
  const { showModal } = useModal();
  const [professionals, setProfessionals] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    district: '',
    language: '',
    specialty: '',
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [proRes, emergencyRes] = await Promise.all([
        api.get('/professionals', { params: filters }),
        api.get('/professionals/emergency/contacts'),
      ]);
      setProfessionals(proRes.data);
      setEmergencyContacts(emergencyRes.data);
    } catch (err) {
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

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Find Mental Health Support</h1>
      <p className="text-center text-muted mb-4">
        Connect with verified professionals, hospitals, and helplines in Malawi.
      </p>

      {/* Emergency Quick Card */}
      <Card className="border-danger p-3 mb-4 text-center">
        <h5>🚨 Need Immediate Help?</h5>
        <p className="mb-2">If you are in crisis, call <strong>999</strong> (Police) or go to your nearest hospital.</p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Button variant="danger" size="sm">Emergency Contacts</Button>
        </div>
      </Card>

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
      {loading ? (
        <Spinner animation="border" />
      ) : professionals.length === 0 ? (
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
        {Object.keys(emergencyContacts).map(type => (
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
        ))}
      </Row>
    </Container>
  );
};

export default FindHelp;