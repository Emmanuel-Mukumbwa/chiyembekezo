import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';

const Result = () => {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return (
      <Container className="my-5 text-center">
        <h4>No assessment result found. Please take a test first.</h4>
        <Button as={Link} to="/assessments">Go to Assessments</Button>
      </Container>
    );
  }

  const { score, level, description, recommendations } = data;

  // Emoji based on level
  const getEmoji = (lvl) => {
    const map = {
      'Minimal': '😊',
      'Mild': '🙂',
      'Moderate': '😐',
      'Moderately Severe': '😔',
      'Severe': '😭'
    };
    return map[lvl] || '😊';
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="feature-card p-4 text-center">
            <h3>Your Result</h3>
            <div style={{ fontSize: '4rem' }}>{getEmoji(level)}</div>
            <h4 className="mt-2">{level} Risk</h4>
            <p className="text-muted">Score: {score}</p>
            <Card.Text>{description}</Card.Text>
            <hr />
            <h5>Recommended next steps</h5>
            <ListGroup variant="flush" className="text-start">
              {recommendations && recommendations.map((rec, idx) => (
                <ListGroup.Item key={idx}>✅ {rec}</ListGroup.Item>
              ))}
            </ListGroup>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
              <Button as={Link} to="/dashboard" variant="primary">Go to Dashboard</Button>
              <Button as={Link} to="/find-help" variant="outline-primary">Find Help</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Result;