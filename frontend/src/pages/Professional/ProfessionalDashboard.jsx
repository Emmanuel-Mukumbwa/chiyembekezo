import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Spinner, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { usePrompt } from '../../hooks/usePrompt';
import api from '../../services/api';
import { Card, Button, StatCard } from '../../components/ui';

const ProfessionalDashboard = () => {
  const { logout } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Block navigation to /login with confirmation
  usePrompt(
    () => {
      logout();
      navigate('/login');
    },
    () => {}
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/professional/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load dashboard.';
      showModal('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showModal(
      'Confirm Logout',
      'Are you sure you want to logout?',
      () => {
        logout();
        navigate('/login');
      }
    );
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="my-5 text-center">
        <p>No professional data found.</p>
        <Button as={Link} to="/profile" variant="primary">Update Profile</Button>
      </Container>
    );
  }

  const { professional, appointmentStats, recentAppointments, totalPatients, todayAppointments } = dashboardData;

  return (
    <Container fluid className="px-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold">Professional Dashboard</h2>
          {!professional.isVerified && <Badge bg="warning" className="mt-1">⚠️ Not Verified</Badge>}
        </div>
        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}><StatCard icon="📅" value={todayAppointments} label="Today's Appointments" variant="info" /></Col>
        <Col md={3} sm={6}><StatCard icon="👤" value={totalPatients} label="Total Patients" variant="primary" /></Col>
        <Col md={3} sm={6}><StatCard icon="⏳" value={appointmentStats.pending} label="Pending Appointments" variant="warning" /></Col>
        <Col md={3} sm={6}><StatCard icon="✅" value={appointmentStats.completed} label="Completed" variant="success" /></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="p-3">
            <h6 className="fw-bold">Recent Appointments</h6>
            {recentAppointments.length === 0 ? (
              <p className="text-muted mt-2">No recent appointments.</p>
            ) : (
              <Table striped hover responsive size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map(appt => (
                    <tr key={appt.id}>
                      <td>{new Date(appt.scheduled_time).toLocaleString()}</td>
                      <td>{appt.first_name} {appt.last_name}</td>
                      <td>
                        <Badge bg={
                          appt.status === 'pending' ? 'warning' :
                          appt.status === 'confirmed' ? 'info' :
                          appt.status === 'completed' ? 'success' :
                          appt.status === 'cancelled' ? 'secondary' : 'danger'
                        }>
                          {appt.status}
                        </Badge>
                      </td>
                      <td>{appt.meeting_type || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            <Button as={Link} to="/professional/appointments" variant="outline-primary" size="sm">
              View All Appointments
            </Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <h6 className="fw-bold">Quick Actions</h6>
            <div className="d-grid gap-2">
              <Button as={Link} to="/professional/availability" variant="outline-primary">Manage Availability</Button>
              <Button as={Link} to="/profile" variant="outline-secondary">Edit Profile</Button>
              <Button as={Link} to="/professional/patients" variant="outline-secondary">View Patients</Button>
              <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalDashboard;
