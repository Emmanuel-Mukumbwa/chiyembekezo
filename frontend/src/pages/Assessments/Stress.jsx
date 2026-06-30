import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Stress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = [
    'In the last month, how often have you been upset because of something that happened unexpectedly?',
    'In the last month, how often have you felt that you were unable to control the important things in your life?',
    'In the last month, how often have you felt nervous and stressed?',
    'In the last month, how often have you felt confident about your ability to handle personal problems?',
    'In the last month, how often have you felt that things were going your way?',
    'In the last month, how often have you felt that you could not cope with all the things you had to do?',
    'In the last month, how often have you been able to control irritations in your life?',
    'In the last month, how often have you felt that you were on top of things?',
    'In the last month, how often have you been angered because of things that were outside of your control?',
    'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?'
  ];

  const options = [
    { label: 'Never', value: 0 },
    { label: 'Almost Never', value: 1 },
    { label: 'Sometimes', value: 2 },
    { label: 'Fairly Often', value: 3 },
    { label: 'Very Often', value: 4 }
  ];

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = value;
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAssessment(newAnswers);
    }
  };

  const submitAssessment = async (finalAnswers) => {
    setLoading(true);
    try {
      const payload = {
        userId: user?.id || null,
        type: 'stress',
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
            <h4 className="text-center">Stress Test (PSS-10)</h4>
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

export default Stress;