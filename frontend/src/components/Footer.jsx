import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5 className="text-white">Chiyembekezo</h5>
            <p className="small">
              A digital mental wellness platform for Malawi. <br />
              <em>Hope begins here.</em>
            </p>
          </Col>
          <Col md={2} className="mb-3">
            <h6 className="text-white">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/resources">Learn</Link></li>
              <li><Link to="/assessments">Assessments</Link></li>
              <li><Link to="/find-help">Find Help</Link></li>
            </ul>
          </Col>
          <Col md={2} className="mb-3">
            <h6 className="text-white">Support</h6>
            <ul className="list-unstyled small">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h6 className="text-white">Language</h6>
            <select className="form-select form-select-sm bg-dark text-white border-secondary" style={{ width: 'auto' }}>
              <option value="en">English</option>
              <option value="ch">Chichewa</option>
              <option value="tu">Tumbuka</option>
            </select>
            <p className="small mt-2">© 2026 Chiyembekezo. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;