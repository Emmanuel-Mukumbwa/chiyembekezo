import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const PeerSupport = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [listeners, setListeners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedListener, setSelectedListener] = useState(null);

  useEffect(() => {
    if (user) {
      fetchListeners();
      fetchRequests();
    }
  }, [user]);

  const fetchListeners = async () => {
    try {
      const res = await api.get('/volunteers/available'); // We need this endpoint
      setListeners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/peer-support/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const requestSupport = async (listenerId) => {
    if (!message) {
      showModal('Message Required', 'Please write a brief message.');
      return;
    }
    try {
      await api.post('/peer-support/request', { listenerId, message });
      showModal('Request Sent', 'Your peer support request has been sent.');
      setMessage('');
      fetchRequests();
    } catch (err) {
      showModal('Error', 'Failed to send request.');
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to access peer support.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
      <h2>Peer Support</h2>
      <p>Connect with trained volunteer listeners who are here to support you.</p>

      <Row>
        <Col md={8}>
          <h5>Available Listeners</h5>
          {listeners.length === 0 ? (
            <p className="text-muted">No listeners available right now. Please check back later.</p>
          ) : (
            listeners.map(listener => (
              <Card key={listener.id} className="feature-card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6>Listener</h6>
                    <div className="text-muted small">{listener.bio || 'No bio provided'}</div>
                    <div className="small">Languages: {listener.available_languages?.join(', ') || 'N/A'}</div>
                  </div>
                  <Button variant="primary" onClick={() => setSelectedListener(listener.id)}>
                    Request Support
                  </Button>
                </div>
                {selectedListener === listener.id && (
                  <div className="mt-3">
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="What would you like to talk about?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </Form.Group>
                    <Button variant="success" className="mt-2" onClick={() => requestSupport(listener.id)}>
                      Send Request
                    </Button>
                    <Button variant="secondary" className="mt-2 ms-2" onClick={() => setSelectedListener(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </Col>

        <Col md={4}>
          <Card className="feature-card p-3">
            <h6>Your Requests</h6>
            {requests.length === 0 ? (
              <p className="text-muted">No requests yet.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="border-bottom py-2">
                  <div className="small text-muted">Status: {req.status}</div>
                  <div className="small">Updated: {new Date(req.updated_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PeerSupport;