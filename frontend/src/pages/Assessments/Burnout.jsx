import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const Burnout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal } = useModal();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = [
    'How often do you feel tired?',
    'How often are you physically exhausted?',
    'How often are you emotionally exhausted?',
    'How often do you think: "I can’t take it anymore"?',
    'How often do you feel worn out?',
    'How often do you feel weak and susceptible to illness?'
  ];

  const options = [
    { label: 'Never / Almost Never', value: 0 },
    { label: 'Seldom', value: 1 },
    { label: 'Sometimes', value: 2 },
    { label: 'Often', value: 3 },
    { label: 'Always', value: 4 }
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
        type: 'cbi',  // note: type is 'cbi' for backend
        answers: finalAnswers,
      };
      const res = await api.post('/assessments/submit', payload);
      navigate('/assessments/result', { state: res.data });
    } catch (err) {
      showModal('Error', 'Error submitting assessment. Please try again.');
      setLoading(false);
    }
  };

  const progress = ((currentQ) / questions.length) * 100;

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="feature-card p-4">
            <h4 className="text-center">Burnout Test (CBI)</h4>
            <p className="text-muted text-center small">Copenhagen Burnout Inventory – Personal Burnout</p>
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

export default Burnout;