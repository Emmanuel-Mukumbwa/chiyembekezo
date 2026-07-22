import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const ProfessionalReports = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        api.get('/professional/reports/stats'),
        api.get('/professional/appointments/past'),
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      showModal('Error', 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (!stats) return <p>No data.</p>;

  // Chart: appointments per month (last 6 months)
  const months = [];
  const counts = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    months.push(label);
    const count = appointments.filter(a => {
      const ad = new Date(a.scheduled_time);
      return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
    }).length;
    counts.push(count);
  }

  const chartData = {
    labels: months,
    datasets: [{
      label: 'Appointments',
      data: counts,
      backgroundColor: '#0d6efd',
    }]
  };

  return (
    <Container>
      <h4>Reports</h4>
      <Row>
        <Col md={3}><Card className="text-center p-2"><h6>Total Patients</h6><h3>{stats.total_patients}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Total Appointments</h6><h3>{stats.total_appointments}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Avg Rating</h6><h3>{stats.avg_rating || 'N/A'}</h3></Card></Col>
        <Col md={3}><Card className="text-center p-2"><h6>Upcoming</h6><h3>{stats.upcoming}</h3></Card></Col>
      </Row>
      <Card className="feature-card p-3 mt-3">
        <h6>Appointment Trend (Last 6 Months)</h6>
        <div style={{ height: '250px' }}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </Card>
    </Container>
  );
};

export default ProfessionalReports;