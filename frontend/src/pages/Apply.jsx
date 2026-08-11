import React, { useState } from 'react';
import { Container, Form, Alert, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Button, Input, Select, Textarea } from '../components/ui';
import api from '../services/api';

const steps = [
  { label: 'Type' },
  { label: 'Personal' },
  { label: 'Details' },
  { label: 'Availability' },
  { label: 'Documents' },
  { label: 'Submit' },
];

const professions = [
  'Psychiatrist', 'Clinical Psychologist', 'Psychologist', 'Counsellor',
  'Social Worker', 'Psychiatric Nurse', 'Occupational Therapist', 'Other',
];

const volunteerRoles = [
  'Peer Listener', 'Community Outreach', 'Mental Health Awareness',
  'Community Support', 'Content & Education', 'Event Support',
];

const initialForm = {
  firstName: '', lastName: '', phone: '', district: '', languages: '',
  profession: '', specialization: '', qualifications: '', experience: '',
  license_number: '', registration_body: '', registration_number: '',
  registration_expiry: '', employer: '',
  role_preference: '', motivation: '', community_experience: '',
  availability: '', message: '',
};

const Apply = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState('professional');
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    // Merge with existing files (avoid duplicates by name)
    setDocuments(prev => {
      const existingNames = prev.map(f => f.name);
      const filtered = newFiles.filter(f => !existingNames.includes(f.name));
      return [...prev, ...filtered];
    });
    // Reset the file input so the same file can be re‑selected if removed manually
    e.target.value = null;
  };

  const removeFile = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return form.firstName && form.phone && form.district;
    if (step === 2 && type === 'professional') return form.profession && form.specialization;
    if (step === 2 && type === 'volunteer') return form.role_preference;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('phone', form.phone);
      fd.append('district', form.district);
      fd.append('languages', JSON.stringify(form.languages ? form.languages.split(',').map(l => l.trim()) : []));
      if (type === 'professional') {
        fd.append('profession', form.profession);
        fd.append('specialization', form.specialization);
        fd.append('qualifications', form.qualifications);
        fd.append('experience', form.experience);
        fd.append('license_number', form.license_number);
        fd.append('registration_body', form.registration_body);
        fd.append('registration_number', form.registration_number);
        fd.append('registration_expiry', form.registration_expiry);
        fd.append('employer', form.employer);
      } else {
        fd.append('role_preference', form.role_preference);
        fd.append('motivation', form.motivation);
        fd.append('experience', form.community_experience);
      }
      fd.append('availability', form.availability);
      fd.append('message', form.message);
      // Append all accumulated files
      documents.forEach(file => fd.append('documents', file));

      await api.post('/applications', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm(initialForm);
      setDocuments([]);
      setStep(0);
      setType('professional');
      showModal('Success', 'Application submitted successfully! You can track its progress in My Applications.');
      navigate('/applications');
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed.';
      setError(msg);
      if (msg.includes('already have a pending application')) {
        setError('You already have a pending application for this role. Please wait for review.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to apply.</h3>
        <Button as="a" href="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  const progressPercent = ((step + 1) / steps.length) * 100;

  return (
    <Container className="my-5" style={{ maxWidth: '720px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Join Chiyembekezo</h2>
        <Link to="/applications" className="btn btn-outline-secondary btn-sm">My Applications</Link>
      </div>
      <p className="text-muted mb-4">Apply as a professional or volunteer.</p>

      <ProgressBar now={progressPercent} className="mb-3" label={`Step ${step+1} of ${steps.length}`} />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4">
        {/* Step 0: Type selection */}
        {step === 0 && (
          <>
            <h5>Select Application Type</h5>
            <Row>
              <Col>
                <Card
                  className={`p-3 text-center ${type === 'professional' ? 'border-primary' : ''}`}
                  onClick={() => setType('professional')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6>👨‍⚕️ Professional</h6>
                  <small>Licensed mental health provider</small>
                </Card>
              </Col>
              <Col>
                <Card
                  className={`p-3 text-center ${type === 'volunteer' ? 'border-primary' : ''}`}
                  onClick={() => setType('volunteer')}
                  style={{ cursor: 'pointer' }}
                >
                  <h6>🤝 Volunteer</h6>
                  <small>Peer & community support</small>
                </Card>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <>
            <h5>Personal Information</h5>
            <Row>
              <Col md={6}>
                <Input label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
              </Col>
              <Col md={6}>
                <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
              </Col>
            </Row>
            <Input label="Phone Number *" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            <Input label="District" name="district" value={form.district} onChange={handleChange} required />
            <Input label="Languages (comma separated)" name="languages" value={form.languages} onChange={handleChange} placeholder="English, Chichewa" />
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!canProceed()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 2: Professional/Volunteer Details */}
        {step === 2 && type === 'professional' && (
          <>
            <h5>Professional Details</h5>
            <Select label="Profession *" name="profession" value={form.profession}
              options={professions.map(p => ({ value: p, label: p }))} onChange={handleChange} required />
            <Input label="Specialization *" name="specialization" value={form.specialization} onChange={handleChange} required />
            <Input label="Qualifications" name="qualifications" value={form.qualifications} onChange={handleChange} />
            <Input label="Years of Experience" name="experience" type="number" value={form.experience} onChange={handleChange} />
            <Input label="License/Certificate Number" name="license_number" value={form.license_number} onChange={handleChange} />
            <Input label="Registration Body" name="registration_body" value={form.registration_body} onChange={handleChange} />
            <Input label="Registration Number" name="registration_number" value={form.registration_number} onChange={handleChange} />
            <Input label="Registration Expiry" name="registration_expiry" type="date" value={form.registration_expiry} onChange={handleChange} />
            <Input label="Current Employer/Practice" name="employer" value={form.employer} onChange={handleChange} />
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!canProceed()}>Next</Button>
            </div>
          </>
        )}

        {step === 2 && type === 'volunteer' && (
          <>
            <h5>Volunteer Details</h5>
            <Select label="Preferred Role *" name="role_preference" value={form.role_preference}
              options={volunteerRoles.map(r => ({ value: r, label: r }))} onChange={handleChange} required />
            <Textarea label="Why would you like to volunteer with Chiyembekezo?" name="motivation" value={form.motivation} onChange={handleChange} rows={3} />
            <Textarea label="Relevant experience or skills" name="community_experience" value={form.community_experience} onChange={handleChange} rows={3} />
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep} disabled={!canProceed()}>Next</Button>
            </div>
          </>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <>
            <h5>Availability</h5>
            <Textarea label="Describe your typical availability (days, hours, online/in-person)" name="availability" value={form.availability} onChange={handleChange} rows={4} />
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        )}

        {/* Step 4: Documents – now with accumulation and remove */}
        {step === 4 && (
          <>
            <h5>Supporting Documents</h5>
            <p className="text-muted small">Upload your CV, certificates, or any other documents (max 5 files, 10MB each). You can add multiple files one by one.</p>
            <Form.Group className="mb-3">
              <Form.Label>Choose Files</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </Form.Group>
            {documents.length > 0 && (
              <ul className="list-unstyled">
                {documents.map((f, idx) => (
                  <li key={idx} className="d-flex justify-content-between align-items-center mb-1">
                    <span>{f.name} ({(f.size/1024).toFixed(1)} KB)</span>
                    <Button variant="outline-danger" size="sm" onClick={() => removeFile(idx)}>Remove</Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next</Button>
            </div>
          </>
        )}

        {/* Step 5: Additional message & submit */}
        {step === 5 && (
          <>
            <h5>Additional Message</h5>
            <Textarea label="Anything else we should know?" name="message" value={form.message} onChange={handleChange} rows={3} />
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-secondary" onClick={prevStep}>Back</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Apply;
