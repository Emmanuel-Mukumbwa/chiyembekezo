import { useState } from 'react';
import { Navbar, Nav, Container, Button, Modal, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleEmergencyOpen = () => setShowEmergency(true);
  const handleEmergencyClose = () => setShowEmergency(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
            Chiyembekezo
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-lg-center">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
              <Nav.Link as={Link} to="/resources">Resources</Nav.Link>
              <Nav.Link as={Link} to="/assessments">Assessments</Nav.Link>
              <Nav.Link as={Link} to="/community">Community</Nav.Link>
              <Nav.Link as={Link} to="/find-help">Find Help</Nav.Link>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
              <Nav.Link as={Link} to="/faq">FAQ</Nav.Link>
              <Button
                variant="danger"
                size="sm"
                className="ms-lg-3 my-2 my-lg-0"
                onClick={handleEmergencyOpen}
              >
                🚨 Emergency
              </Button>
              {user ? (
                <Dropdown align="end" className="ms-lg-3">
                  <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-user">
                    {user.firstName || user.email}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/dashboard">Dashboard</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="ms-lg-2">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register" className="btn btn-primary text-white ms-lg-2 px-3">
                    Sign Up
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Emergency Modal */}
      <Modal show={showEmergency} onHide={handleEmergencyClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>🚨 Immediate Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold">If you are in immediate danger, call <span className="text-danger">999</span> (Police) or go to your nearest hospital.</p>
          <hr />
          <h6>Trusted Helplines in Malawi</h6>
          <ul className="list-unstyled">
            <li><strong>Mental Health Helpline:</strong> +265 999 123 456</li>
            <li><strong>Child Helpline:</strong> 116 (toll-free)</li>
            <li><strong>Domestic Violence Support:</strong> +265 888 123 456</li>
          </ul>
          <p className="mb-0">Talk to someone you trust. You are not alone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleEmergencyClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navigation;