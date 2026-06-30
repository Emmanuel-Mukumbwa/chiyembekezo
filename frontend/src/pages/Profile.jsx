import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    location: '',
    district: '',
    city: '',
    occupation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredLanguage: 'en',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        dateOfBirth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        gender: user.gender || '',
        bio: user.bio || '',
        location: user.location || '',
        district: user.district || '',
        city: user.city || '',
        occupation: user.occupation || '',
        emergencyContactName: user.emergency_contact_name || '',
        emergencyContactPhone: user.emergency_contact_phone || '',
        preferredLanguage: user.preferred_language || 'en',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-5">Please log in to view your profile.</div>;
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="feature-card p-4">
            <h3 className="text-center">Your Profile</h3>
            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={user.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </Form.Group>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </Form.Group>
              <h6 className="mt-3">Emergency Contact</h6>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Preferred Language</Form.Label>
                <Form.Select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}>
                  <option value="en">English</option>
                  <option value="ch">Chichewa</option>
                  <option value="tu">Tumbuka</option>
                  <option value="ya">Yao</option>
                </Form.Select>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;