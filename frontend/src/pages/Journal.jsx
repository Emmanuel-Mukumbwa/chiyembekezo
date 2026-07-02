import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Journal = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_at_entry: '',
    entry_type: 'free',
    is_favorite: false,
  });

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/journal');
      setEntries(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load journal entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await api.put(`/journal/${editingEntry.id}`, formData);
        showModal('Success', 'Entry updated!');
      } else {
        await api.post('/journal', formData);
        showModal('Success', 'Entry saved!');
      }
      setShowEditModal(false);
      setEditingEntry(null);
      setFormData({ title: '', content: '', mood_at_entry: '', entry_type: 'free', is_favorite: false });
      fetchEntries();
    } catch (err) {
      showModal('Error', 'Failed to save entry.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await api.delete(`/journal/${id}`);
        fetchEntries();
        showModal('Success', 'Entry deleted.');
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    }
  };

  const openEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || '',
      content: entry.content || '',
      mood_at_entry: entry.mood_at_entry || '',
      entry_type: entry.entry_type || 'free',
      is_favorite: entry.is_favorite || false,
    });
    setShowEditModal(true);
  };

  const toggleFavorite = async (id, current) => {
    try {
      await api.put(`/journal/${id}`, { is_favorite: !current });
      fetchEntries();
    } catch (err) {
      showModal('Error', 'Failed to update favorite.');
    }
  };

  const entryTypeLabel = (type) => {
    const labels = { free: 'Free', guided: 'Guided', gratitude: 'Gratitude' };
    return labels[type] || type;
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <h3>Please log in to access your journal.</h3>
        <Button as={Link} to="/login" variant="primary">Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Journal</h2>
        <div>
          <Button variant="primary" onClick={() => { setEditingEntry(null); setFormData({ title: '', content: '', mood_at_entry: '', entry_type: 'free', is_favorite: false }); setShowEditModal(true); }}>
            + New Entry
          </Button>
          <Button as={Link} to="/dashboard" variant="outline-secondary" className="ms-2">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <Card className="feature-card p-3">
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Mood</th>
              <th>Type</th>
              <th>Words</th>
              <th>⭐</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No journal entries yet. Start writing!</td></tr>
            ) : (
              entries.map(entry => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleDateString()}</td>
                  <td>{entry.title || '(no title)'}</td>
                  <td>{entry.mood_at_entry ? ['😭','😔','😐','🙂','😊'][entry.mood_at_entry-1] : '-'}</td>
                  <td><Badge bg="secondary">{entryTypeLabel(entry.entry_type)}</Badge></td>
                  <td>{entry.word_count || 0}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => toggleFavorite(entry.id, entry.is_favorite)}
                      className="p-0"
                    >
                      {entry.is_favorite ? '⭐' : '☆'}
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" onClick={() => openEdit(entry)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" className="ms-1" onClick={() => handleDelete(entry.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Edit/Create Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingEntry ? 'Edit Entry' : 'New Entry'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mood</Form.Label>
                  <Form.Select
                    value={formData.mood_at_entry}
                    onChange={(e) => setFormData({ ...formData, mood_at_entry: e.target.value })}
                  >
                    <option value="">Select mood</option>
                    <option value="5">😊 Happy</option>
                    <option value="4">🙂 Okay</option>
                    <option value="3">😐 Neutral</option>
                    <option value="2">😔 Sad</option>
                    <option value="1">😭 Overwhelmed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Entry Type</Form.Label>
                  <Form.Select
                    value={formData.entry_type}
                    onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })}
                  >
                    <option value="free">Free Writing</option>
                    <option value="guided">Guided Prompt</option>
                    <option value="gratitude">Gratitude</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Favorite</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="⭐ Mark as favorite"
                    checked={formData.is_favorite}
                    onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Journal;