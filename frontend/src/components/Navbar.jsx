import { useState } from 'react';
import { Navbar, Nav, Container, Button, Modal, Dropdown } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleEmergencyOpen = () => setShowEmergency(true);
  const handleEmergencyClose = () => setShowEmergency(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <>
      <Navbar
        bg="white"
        expand="lg"
        className="shadow-sm py-3"
        expanded={expanded}
        onToggle={setExpanded}
      >
        <Container>
          <Navbar.Brand
            as={NavLink}
            to="/"
            className="fw-bold text-primary"
            onClick={handleNavClick}
            end
          >
            Chiyembekezo
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-lg-center">
              <Nav.Link
                as={NavLink}
                to="/"
                onClick={handleNavClick}
                end
                className="nav-link"
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/about"
                onClick={handleNavClick}
                className="nav-link"
              >
                About
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/resources"
                onClick={handleNavClick}
                className="nav-link"
              >
                Resources
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/assessments"
                onClick={handleNavClick}
                className="nav-link"
              >
                Assessments
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/community"
                onClick={handleNavClick}
                className="nav-link"
              >
                Community
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/find-help"
                onClick={handleNavClick}
                className="nav-link"
              >
                Find Help
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/emergency"
                onClick={handleNavClick}
                className="nav-link text-danger fw-bold"
              >
                🚨 Emergency
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/contact"
                onClick={handleNavClick}
                className="nav-link"
              >
                Contact
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/faq"
                onClick={handleNavClick}
                className="nav-link"
              >
                FAQ
              </Nav.Link>

              {/* Quick emergency modal button */}
              <Button
                variant="danger"
                size="sm"
                className="ms-lg-2 my-2 my-lg-0"
                onClick={() => {
                  handleEmergencyOpen();
                  setExpanded(false);
                }}
              >
                🚨 Help Now
              </Button>

              {user ? (
                <Dropdown align="end" className="ms-lg-2">
                  <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-user">
                    {user.firstName || user.email}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={NavLink} to="/dashboard" onClick={handleNavClick}>
                      📊 Dashboard
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as={NavLink} to="/journal" onClick={handleNavClick}>
                      📝 Journal
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/habits" onClick={handleNavClick}>
                      ✅ Habits
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/goals" onClick={handleNavClick}>
                      🎯 Goals
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/safety-plan" onClick={handleNavClick}>
                      🛡️ Safety Plan
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/mood-history" onClick={handleNavClick}>
                      📈 Mood History
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/achievements" onClick={handleNavClick}>
                      🏆 Achievements
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as={NavLink} to="/wellness" onClick={handleNavClick}>
                      🧘 Wellness Toolkit
                    </Dropdown.Item>
                    <Dropdown.Item as={NavLink} to="/profile" onClick={handleNavClick}>
                      👤 Profile
                    </Dropdown.Item>
                    {user.isProfessional && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={NavLink} to="/professional/availability" onClick={handleNavClick}>
                          📅 Manage Availability
                        </Dropdown.Item>
                      </>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link
                    as={NavLink}
                    to="/login"
                    className="ms-lg-2 nav-link"
                    onClick={handleNavClick}
                  >
                    Login
                  </Nav.Link>
                  <Button
                    as={NavLink}
                    to="/register"
                    variant="primary"
                    className="ms-lg-2 px-3 py-1"
                    onClick={handleNavClick}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Emergency Modal - Quick Dial */}
      <Modal show={showEmergency} onHide={handleEmergencyClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>🚨 Immediate Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold">
            If you are in immediate danger, call <span className="text-danger">999</span> (Police) or go to your nearest hospital.
          </p>
          <hr />
          <h6>Trusted Helplines in Malawi</h6>
          <ul className="list-unstyled">
            <li><strong>Mental Health Helpline:</strong> +265 999 123 456</li>
            <li><strong>Child Helpline:</strong> 116 (toll-free)</li>
            <li><strong>Domestic Violence Support:</strong> +265 888 123 456</li>
          </ul>
          <p className="mb-0">Talk to someone you trust. You are not alone.</p>
          <div className="mt-3">
            <Button as={NavLink} to="/emergency" variant="danger" onClick={handleEmergencyClose} className="w-100">
              Open Full Emergency Page →
            </Button>
          </div>
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