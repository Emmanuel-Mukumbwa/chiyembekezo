import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Quiz = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showModal } = useModal();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resources/quizzes/${id}`);
      setQuiz(res.data);
      // Initialize answers
      const initial = {};
      res.data.questions.forEach((_, idx) => initial[idx] = -1);
      setAnswers(initial);
    } catch (err) {
      showModal('Error', 'Quiz not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleSubmit = async () => {
    // Check if all questions answered
    const allAnswered = Object.values(answers).every(a => a !== -1);
    if (!allAnswered) {
      showModal('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    if (!user) {
      showModal('Login Required', 'Please log in to submit your quiz.');
      return;
    }

    try {
      const res = await api.post(`/resources/quizzes/${id}/submit`, {
        answers: Object.values(answers),
      });
      setResult(res.data);
      setSubmitted(true);
      if (res.data.passed) {
        showModal('🎉 Quiz Complete!', `You scored ${res.data.score}%! Well done!`);
      } else {
        showModal('Keep Learning', `You scored ${res.data.score}%. Review and try again.`);
      }
    } catch (err) {
      showModal('Error', 'Failed to submit quiz.');
    }
  };

  const goToNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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

  if (!quiz) {
    return (
      <Container className="my-5 text-center">
        <h3>Quiz not found</h3>
        <Button as={Link} to="/resources">Back to Resources</Button>
      </Container>
    );
  }

  if (submitted && result) {
    return (
      <Container className="my-5">
        <Card className="feature-card p-4 text-center">
          <h2>Quiz Results</h2>
          <div className="my-4">
            <div style={{ fontSize: '4rem' }}>{result.passed ? '🎉' : '📚'}</div>
            <h3>Score: {result.score}%</h3>
            <p>{result.passed ? 'Congratulations! You passed!' : 'Keep learning and try again!'}</p>
            <p>Correct: {result.correct} / {result.total}</p>
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/resources" variant="outline-primary">Back to Resources</Button>
            <Button onClick={() => window.location.reload()} variant="primary">Retake Quiz</Button>
          </div>
        </Card>
      </Container>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Container className="my-5">
      <Button as={Link} to="/resources" variant="outline-secondary" className="mb-3">
        ← Back to Resources
      </Button>

      <Card className="feature-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>{quiz.title}</h3>
          <span className="text-muted">Question {currentQuestion + 1} of {totalQuestions}</span>
        </div>

        <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-3" />

        <h5 className="mb-3">{question.question}</h5>

        <Form.Group>
          {question.options.map((option, idx) => (
            <Form.Check
              key={idx}
              type="radio"
              label={option}
              name={`question_${currentQuestion}`}
              checked={answers[currentQuestion] === idx}
              onChange={() => handleAnswer(currentQuestion, idx)}
              className="mb-2"
            />
          ))}
        </Form.Group>

        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="outline-secondary"
            onClick={goToPrev}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          <div>
            {currentQuestion === totalQuestions - 1 ? (
              <Button variant="success" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            ) : (
              <Button variant="primary" onClick={goToNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default Quiz;