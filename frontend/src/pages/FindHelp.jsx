import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Mock data – later from DB
const professionals = [
  {
    id: 1,
    name: 'Dr. Grace Banda',
    qualification: 'Clinical Psychologist',
    experience: '12 years',
    district: 'Lilongwe',
    languages: ['English', 'Chichewa'],
    specialties: ['Depression', 'Anxiety', 'Trauma'],
    fee: 'MK 15,000',
    available: true,
    photo: '👩‍⚕️',
  },
  {
    id: 2,
    name: 'Mr. John Phiri',
    qualification: 'Counselling Psychologist',
    experience: '8 years',
    district: 'Blantyre',
    languages: ['English', 'Chichewa', 'Tumbuka'],
    specialties: ['Stress', 'Relationships', 'Grief'],
    fee: 'MK 10,000',
    available: true,
    photo: '🧑‍⚕️',
  },
  {
    id: 3,
    name: 'Ms. Sarah Mwale',
    qualification: 'Social Worker (Mental Health)',
    experience: '5 years',
    district: 'Mzuzu',
    languages: ['English', 'Tumbuka'],
    specialties: ['Child & Youth', 'GBV', 'Substance Abuse'],
    fee: 'Free (NGO)',
    available: false,
    photo: '👩‍💼',
  },
];

const hospitals = [
  { name: 'Queen Elizabeth Central Hospital', district: 'Blantyre', phone: '01 876 000' },
  { name: 'Kamuzu Central Hospital', district: 'Lilongwe', phone: '01 756 000' },
  { name: 'Mzuzu Central Hospital', district: 'Mzuzu', phone: '01 320 000' },
];

const ngos = [
  { name: 'Youth Mental Health Malawi', district: 'Lilongwe', phone: '+265 999 111 222' },
  { name: 'GBV Support Network', district: 'Blantyre', phone: '116 (toll-free)' },
];

const helplines = [
  { name: 'Mental Health Helpline', phone: '+265 999 123 456', hours: '24/7' },
  { name: 'Child Helpline', phone: '116 (toll-free)', hours: '24/7' },
  { name: 'Domestic Violence Support', phone: '+265 888 123 456', hours: '8am – 6pm' },
];

const FindHelp = () => {
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchLanguage, setSearchLanguage] = useState('All');
  const [searchSpecialty, setSearchSpecialty] = useState('All');

  const filteredProfessionals = professionals.filter(p => {
    const matchDistrict = p.district.toLowerCase().includes(searchDistrict.toLowerCase());
    const matchLanguage = searchLanguage === 'All' || p.languages.includes(searchLanguage);
    const matchSpecialty = searchSpecialty === 'All' || p.specialties.includes(searchSpecialty);
    return matchDistrict && matchLanguage && matchSpecialty;
  });

  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Find Mental Health Support</h1>
          <p className="hero-subtitle">Connect with professionals, hospitals, and organizations near you.</p>
        </Container>
      </section>

      {/* Emergency Quick Card */}
      <Container className="my-4">
        <Card className="border-danger p-3 text-center">
          <h5>🚨 Need Immediate Help?</h5>
          <p className="mb-2">If you are in crisis, please call <strong>999</strong> (Police) or go to your nearest hospital.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Button variant="danger" size="sm">Emergency Contacts</Button>
            <Button variant="outline-danger" size="sm">Hospitals</Button>
          </div>
        </Card>
      </Container>

      {/* Search */}
      <Container className="my-4">
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <Form.Label>District</Form.Label>
            <Form.Control
              placeholder="e.g., Lilongwe"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Language</Form.Label>
            <Form.Select value={searchLanguage} onChange={(e) => setSearchLanguage(e.target.value)}>
              <option>All</option>
              <option>English</option>
              <option>Chichewa</option>
              <option>Tumbuka</option>
              <option>Yao</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Specialty</Form.Label>
            <Form.Select value={searchSpecialty} onChange={(e) => setSearchSpecialty(e.target.value)}>
              <option>All</option>
              <option>Depression</option>
              <option>Anxiety</option>
              <option>Trauma</option>
              <option>Stress</option>
              <option>Relationships</option>
              <option>Grief</option>
              <option>Youth</option>
              <option>GBV</option>
              <option>Substance Abuse</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100">Search</Button>
          </Col>
        </Row>
      </Container>

      {/* Professionals */}
      <Container className="my-5">
        <h2 className="mb-3">Professionals</h2>
        <Row>
          {filteredProfessionals.length === 0 ? (
            <p className="text-muted">No professionals found matching your criteria.</p>
          ) : (
            filteredProfessionals.map(p => (
              <Col md={6} lg={4} key={p.id} className="mb-3">
                <Card className="feature-card h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: '3rem' }}>{p.photo}</span>
                      <div className="ms-3">
                        <h5>{p.name}</h5>
                        <div className="text-muted small">{p.qualification}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge bg="secondary">{p.district}</Badge>{' '}
                      <Badge bg="info" text="dark">{p.languages.join(', ')}</Badge>
                    </div>
                    <div className="mt-2">
                      <span className="small">⭐ {p.experience} experience</span>
                      <br />
                      <span className="small">💰 {p.fee}</span>
                    </div>
                    <div className="mt-2">
                      {p.specialties.map(s => <Badge key={s} bg="light" text="dark" className="me-1">{s}</Badge>)}
                    </div>
                    <Button
                      variant={p.available ? 'primary' : 'secondary'}
                      size="sm"
                      className="mt-3"
                      disabled={!p.available}
                    >
                      {p.available ? 'View Profile' : 'Unavailable'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Hospitals, NGOs, Helplines */}
      <Container className="my-5">
        <Row>
          <Col md={4}>
            <Card className="feature-card p-3">
              <h5>🏥 Hospitals</h5>
              <ul className="list-unstyled">
                {hospitals.map(h => (
                  <li key={h.name} className="mb-2">
                    <strong>{h.name}</strong><br />
                    <span className="text-muted small">{h.district}</span><br />
                    <span className="text-muted small">📞 {h.phone}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card p-3">
              <h5>🤝 NGOs & Support</h5>
              <ul className="list-unstyled">
                {ngos.map(n => (
                  <li key={n.name} className="mb-2">
                    <strong>{n.name}</strong><br />
                    <span className="text-muted small">{n.district}</span><br />
                    <span className="text-muted small">📞 {n.phone}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card p-3">
              <h5>📞 Helplines</h5>
              <ul className="list-unstyled">
                {helplines.map(h => (
                  <li key={h.name} className="mb-2">
                    <strong>{h.name}</strong><br />
                    <span className="text-muted small">{h.phone}</span><br />
                    <span className="text-muted small">🕒 {h.hours}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default FindHelp;