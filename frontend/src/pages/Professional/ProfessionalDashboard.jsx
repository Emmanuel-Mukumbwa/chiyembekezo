import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Badge, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const ProfessionalDashboard = () => {
  const { showModal } = useModal();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="my-5 text-center">
        <p>No professional data found.</p>
        <Link to="/profile" className="btn btn-primary">Update Profile</Link>
      </Container>
    );
  }

  const { professional, appointmentStats, recentAppointments, totalPatients, todayAppointments } = dashboardData;

  return (
    <Container className="my-4">
      <h2>Professional Dashboard</h2>
      {!professional.isVerified && (
        <div className="alert alert-warning">
          Your account is not yet verified. Some features may be limited.
        </div>
      )}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center p-3 bg-light">
            <h6>Today's Appointments</h6>
            <h3>{todayAppointments}</h3>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center p-3 bg-light">
            <h6>Total Patients</h6>
            <h3>{totalPatients}</h3>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center p-3 bg-light">
            <h6>Pending Appointments</h6>
            <h3>{appointmentStats.pending}</h3>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center p-3 bg-light">
            <h6>Completed</h6>
            <h3>{appointmentStats.completed}</h3>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="p-3">
            <h5>Recent Appointments</h5>
            {recentAppointments.length === 0 ? (
              <p className="text-muted">No recent appointments.</p>
            ) : (
              <Table striped hover responsive size="sm">
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
            <Link to="/professional/appointments" className="btn btn-outline-primary btn-sm">
              View All Appointments
            </Link>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <h5>Quick Actions</h5>
            <div className="d-grid gap-2">
              <Link to="/professional/availability" className="btn btn-outline-primary">
                Manage Availability
              </Link>
              <Link to="/profile" className="btn btn-outline-secondary">
                Edit Profile
              </Link>
              <Link to="/professional/patients" className="btn btn-outline-secondary">
                View Patients
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfessionalDashboard;