import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const ProfessionalDashboard = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        api.get('/professional/reports/stats'),
        api.get('/professional/appointments/upcoming'),
      ]);
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      showModal('Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!stats) return <p>No data.</p>;

  return (
    <Container>
      <h4>Professional Dashboard</h4>
      <Row>
        <Col md={3}><Card className="text-center p-2"><h6>Total Patients</h6><h3>{stats.total_patients}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Total Appointments</h6><h3>{stats.total_appointments}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Avg Rating</h6><h3>{stats.avg_rating || 'N/A'}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Upcoming</h6><h3>{stats.upcoming}</h3></Card></Col>
      </Row>
      <h5 className="mt-4">Upcoming Appointments</h5>
      <ul>
        {upcoming.map(a => (
          <li key={a.id}>
            {new Date(a.scheduled_time).toLocaleString()} - {a.first_name} {a.last_name} ({a.status})
          </li>
        ))}
        {upcoming.length === 0 && <p>No upcoming appointments.</p>}
      </ul>
    </Container>
  );
};

export default ProfessionalDashboard;