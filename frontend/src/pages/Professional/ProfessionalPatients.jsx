import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Badge } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, EmptyState, ErrorState } from '../../components/ui';

const ProfessionalPatients = () => {
  const { patientId } = useParams();
  const { showModal } = useModal();
  const [patients, setPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      const res = await api.get('/professional/appointments/past');
      const unique = {};
      res.data.forEach(a => {
        if (!unique[a.user_id]) {
          unique[a.user_id] = {
            id: a.user_id,
            first_name: a.first_name,
            last_name: a.last_name,
            email: a.email,
            phone: a.phone,
          };
        }
      });
      setPatients(Object.values(unique));
    } catch (err) {
      setError('Failed to load patients.');
      showModal('Error', 'Failed to load patients.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/professional/appointments/patient/${id}`);
      setHistory(res.data);
      if (res.data.length > 0) {
        setShowHistory(true);
      } else {
        showModal('Info', 'No history found for this patient.');
        setShowHistory(false);
      }
    } catch (err) {
      setError('Failed to load patient history.');
      showModal('Error', 'Failed to load patient history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;

  if (showHistory) {
    const patient = history[0];
    const columns = [
      { field: 'scheduled_time', label: 'Date', render: (val) => new Date(val).toLocaleString() },
      { field: 'status', label: 'Status', render: (val) => <Badge bg="secondary">{val}</Badge> },
      { field: 'rating', label: 'Rating', render: (val) => val ? `${val}⭐` : '-' },
      { field: 'notes', label: 'Notes', render: (val) => val || '-' },
    ];

    return (
      <Container fluid className="px-4">
        <Button variant="outline-secondary" onClick={() => { setShowHistory(false); setHistory([]); fetchPatients(); }} className="mb-3">
          ← Back to Patients
        </Button>
        <h4>History for {patient.first_name} {patient.last_name}</h4>
        <Card className="p-3">
          <DataTable columns={columns} data={history} keyField="id" />
        </Card>
      </Container>
    );
  }

  const columns = [
    { field: 'first_name', label: 'Name', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone', render: (val) => val || '-' },
    {
      field: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button variant="outline-primary" size="sm" onClick={() => fetchPatientHistory(row.id)}>
          View History
        </Button>
      ),
    },
  ];

  return (
    <Container fluid className="px-4">
      <h4>Patients</h4>
      {patients.length === 0 ? (
        <EmptyState icon="👥" title="No patients yet" description="You have no patients." />
      ) : (
        <DataTable columns={columns} data={patients} keyField="id" />
      )}
    </Container>
  );
};

export default ProfessionalPatients;
