import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Spinner, Modal, Badge } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const ProfessionalPatients = () => {
  const { patientId } = useParams();
  const { showModal } = useModal();
  const [patients, setPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientHistory(patientId);
    } else {
      fetchPatients();
    }
  }, [patientId]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // We need an endpoint to get all patients for this professional.
      // For now, we'll use the appointments/past and extract distinct patients.
      const res = await api.get('/professional/appointments/past');
      const unique = {};
      res.data.forEach(a => {
        if (!unique[a.user_id]) {
          unique[a.user_id] = { id: a.user_id, first_name: a.first_name, last_name: a.last_name, email: a.email, phone: a.phone };
        }
      });
      setPatients(Object.values(unique));
    } catch (err) {
      showModal('Error', 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/professional/appointments/patient/${id}`);
      setHistory(res.data);
      if (res.data.length > 0) {
        setShowHistory(true);
      } else {
        showModal('Info', 'No history found for this patient.');
      }
    } catch (err) {
      showModal('Error', 'Failed to load patient history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  if (showHistory) {
    const patient = history[0];
    return (
      <Container>
        <Button variant="outline-secondary" onClick={() => { setShowHistory(false); setHistory([]); fetchPatients(); }} className="mb-3">
          ← Back to Patients
        </Button>
        <h4>History for {patient.first_name} {patient.last_name}</h4>
        <Card className="feature-card p-3">
          <Table striped hover responsive>
            <thead>
              <tr><th>Date</th><th>Status</th><th>Rating</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {history.map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.scheduled_time).toLocaleString()}</td>
                  <td><Badge bg="secondary">{a.status}</Badge></td>
                  <td>{a.rating ? `${a.rating}⭐` : '-'}</td>
                  <td>{a.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <h4>Patients</h4>
      <Card className="feature-card p-3">
        <Table striped hover responsive>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Action</th></tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No patients yet</td></tr>
            ) : (
              patients.map(p => (
                <tr key={p.id}>
                  <td>{p.first_name} {p.last_name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || '-'}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => fetchPatientHistory(p.id)}>
                      View History
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ProfessionalPatients;