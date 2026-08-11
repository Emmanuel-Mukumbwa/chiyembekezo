import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  Button,
  Input,
  Select,
  Textarea,
  DatePicker,
  SectionTitle,
  LoadingSkeleton,
} from '../components/ui';
import LogoutButton from '../components/LogoutButton';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { showModal } = useModal();
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
      showModal('Success', 'Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
      showModal('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Profile</h2>
        <div style={{ width: '100px', height: '36px' }} />
      </div>
      <Card className="p-4">
        <LoadingSkeleton type="article" lines={8} />
      </Card>
    </Container>
  );
  if (!user) return <div className="text-center mt-5">Please log in to view your profile.</div>;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Profile</h2>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Card className="p-4">
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}><Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} /></Col>
            <Col md={6}><Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} /></Col>
          </Row>
          <Input label="Email" name="email" value={user.email} disabled />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <Row>
            <Col md={6}><DatePicker label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></Col>
            <Col md={6}>
              <Select label="Gender" name="gender" value={formData.gender}
                options={[{ value: '', label: 'Prefer not to say' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Non-binary', label: 'Non-binary' }, { value: 'Other', label: 'Other' }]}
                onChange={handleChange} />
            </Col>
          </Row>
          <Textarea label="Bio" name="bio" rows={3} value={formData.bio} onChange={handleChange} />
          <Row>
            <Col md={6}><Input label="Location" name="location" value={formData.location} onChange={handleChange} /></Col>
            <Col md={6}><Input label="District" name="district" value={formData.district} onChange={handleChange} /></Col>
          </Row>
          <Row>
            <Col md={6}><Input label="City" name="city" value={formData.city} onChange={handleChange} /></Col>
            <Col md={6}><Input label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} /></Col>
          </Row>
          <h6 className="mt-3">Emergency Contact</h6>
          <Row>
            <Col md={6}><Input label="Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} /></Col>
            <Col md={6}><Input label="Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} /></Col>
          </Row>
          <Select label="Preferred Language" name="preferredLanguage" value={formData.preferredLanguage}
            options={[{ value: 'en', label: 'English' }, { value: 'ch', label: 'Chichewa' }, { value: 'tu', label: 'Tumbuka' }, { value: 'ya', label: 'Yao' }]}
            onChange={handleChange} />
          <Button variant="primary" type="submit" className="mt-3" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
        </form>
      </Card>
    </Container>
  );
};

export default Profile;
