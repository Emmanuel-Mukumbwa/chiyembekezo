import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Card, StatCard, ErrorState } from '../../components/ui';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const ProfessionalReports = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        api.get('/professional/reports/stats'),
        api.get('/professional/appointments/past'),
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      setError('Failed to load reports.');
      showModal('Error', 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading reports" description={error} onRetry={fetchData} />;
  if (!stats) return <p className="text-center mt-5">No data.</p>;

  const months = [], counts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'short' }));
    counts.push(appointments.filter(a => {
      const ad = new Date(a.scheduled_time);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length);
  }

  const chartData = {
    labels: months,
    datasets: [{ label: 'Appointments', data: counts, backgroundColor: '#0d6efd' }],
  };

  return (
    <Container fluid className="px-4">
      <h4>Reports</h4>
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}><StatCard icon="👤" value={stats.total_patients} label="Total Patients" variant="primary" /></Col>
        <Col xs={6} md={3}><StatCard icon="📅" value={stats.total_appointments} label="Total Appointments" variant="info" /></Col>
        <Col xs={6} md={3}><StatCard icon="⭐" value={stats.avg_rating || 'N/A'} label="Avg Rating" variant="warning" /></Col>
        <Col xs={6} md={3}><StatCard icon="⏳" value={stats.upcoming} label="Upcoming" variant="success" /></Col>
      </Row>
      <Card className="p-3">
        <h6>Appointment Trend (Last 6 Months)</h6>
        <div style={{ height: '250px' }}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </Card>
    </Container>
  );
};

export default ProfessionalReports;
