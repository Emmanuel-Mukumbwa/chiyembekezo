import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PHQ9 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = [
    'Little interest or pleasure in doing things?',
    'Feeling down, depressed, or hopeless?',
    'Trouble falling/staying asleep, or sleeping too much?',
    'Feeling tired or having little energy?',
    'Poor appetite or overeating?',
    'Feeling bad about yourself—or that you are a failure?',
    'Trouble concentrating on things?',
    'Moving or speaking so slowly that others could notice? Or the opposite?',
    'Thoughts that you would be better off dead, or of hurting yourself?'
  ];

  const options = [
    { label: 'Not at all', value: 0 },
    { label: 'Several days', value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day', value: 3 },
  ];

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Submit
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setLoading(true);
    try {
      const payload = {
        userId: user?.id || null,
        type: 'phq9',
        answers: finalAnswers,
      };
      const res = await api.post('/assessments/submit', payload);
      navigate('/assessments/result', { state: res.data });
    } catch (err) {
      alert('Error submitting assessment. Please try again.');
      setLoading(false);
    }
  };

  const progress = ((currentQ) / questions.length) * 100;

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="feature-card p-4">
            <h4 className="text-center">Depression Screening (PHQ-9)</h4>
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="my-3" />
            <p className="text-muted text-center">
              Question {currentQ + 1} of {questions.length}
            </p>
            <h5 className="my-3">{questions[currentQ]}</h5>
            <div className="d-grid gap-2">
              {options.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline-primary"
                  onClick={() => handleAnswer(opt.value)}
                  disabled={loading}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PHQ9;