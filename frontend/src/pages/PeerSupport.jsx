import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { LoadingSkeleton } from '../components/ui';
import api from '../services/api';
import { FiFilter, FiX } from 'react-icons/fi';

const PeerSupport = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [listeners, setListeners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedListener, setSelectedListener] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => { if (user) { fetchListeners(); fetchRequests(); } }, [user]);

  const fetchListeners = async () => {
    try {
      const res = await api.get('/volunteers/available');
      setListeners(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/peer-support/requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
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

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const filteredListeners = listeners.filter(listener => {
    const query = appliedSearch.toLowerCase();
    return (listener.bio || '').toLowerCase().includes(query) ||
           (listener.available_languages || []).join(' ').toLowerCase().includes(query);
  });

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to access peer support.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) return (
    <Container className="my-5">
      <h2>Peer Support</h2>
      <Row>
        <Col md={8}><h5>Available Listeners</h5><LoadingSkeleton type="list" /></Col>
        <Col md={4}><Card className="feature-card p-3"><h6>Your Requests</h6><LoadingSkeleton type="list" /></Card></Col>
      </Row>
    </Container>
  );

  return (
    <Container className="my-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2>Peer Support</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
        </div>
      </div>
      <p>Connect with trained volunteer listeners who are here to support you.</p>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <input
                className="form-control"
                placeholder="Search listeners by bio or language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
              />
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

      <Row>
        <Col md={8}>
          <h5>Available Listeners</h5>
          {filteredListeners.length === 0 ? (
            <p className="text-muted">No listeners available right now. Please check back later.</p>
          ) : (
            filteredListeners.map(listener => (
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
