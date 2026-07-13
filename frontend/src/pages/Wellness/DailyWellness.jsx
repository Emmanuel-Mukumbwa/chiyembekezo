import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const DailyWellness = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchChecklist();
  }, [user]);

  const fetchChecklist = async () => {
    try {
      const res = await api.get('/wellness/daily-wellness');
      setChecklist(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load daily wellness.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      await api.post('/wellness/daily-wellness', { checklist });
      showModal('Success', 'Daily wellness saved!');
    } catch (err) {
      showModal('Error', 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const completed = checklist.filter(item => item.checked).length;
  const total = checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="my-5">
      <h2 className="mb-4">Daily Wellness</h2>
      <Row>
        <Col lg={6} className="mx-auto">
          <Card className="feature-card p-4">
            <h5>Today's Checklist</h5>
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="my-3" />
            <div>
              {checklist.map(item => (
                <Form.Check
                  key={item.id}
                  type="checkbox"
                  id={`check-${item.id}`}
                  label={item.label}
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="py-2 border-bottom"
                />
              ))}
            </div>
            <Button
              variant="primary"
              className="mt-3"
              onClick={saveProgress}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </Button>
          </Card>
        </Col>
      </Row>
      <div className="mt-4 text-center">
        <Button as={Link} to="/wellness" variant="outline-secondary">← Back to Toolkit</Button>
      </div>
    </Container>
  );
};

export default DailyWellness;