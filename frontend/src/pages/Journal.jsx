import React, { useState, useEffect } from 'react';
import { Container, Modal, Form, Spinner, Row, Col, Card, Badge, Collapse } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import {
  Button,
  Input,
  Select,
  Textarea,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../components/ui';
import api from '../services/api';
import { FiFilter, FiX } from 'react-icons/fi';

const Journal = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_at_entry: '',
    entry_type: 'free',
    is_favorite: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/journal');
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load journal entries.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const query = appliedSearch.toLowerCase();
    return (entry.title || '').toLowerCase().includes(query) ||
           (entry.content || '').toLowerCase().includes(query) ||
           (entry.entry_type || '').toLowerCase().includes(query);
  });

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
      showModal('Error', err.response?.data?.error || 'Failed to save entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/journal/${id}`);
      fetchEntries();
      showModal('Success', 'Entry deleted.');
    } catch (err) {
      showModal('Error', 'Failed to delete.');
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

  const columns = [
    { field: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { field: 'title', label: 'Title', render: (val) => val || '(no title)' },
    { field: 'mood_at_entry', label: 'Mood', render: (val) => ['😭','😔','😐','🙂','😊'][val-1] || '-' },
    { field: 'entry_type', label: 'Type' },
    { field: 'word_count', label: 'Words' },
    {
      field: 'is_favorite',
      label: '⭐',
      render: (val, row) => (
        <Button variant="link" onClick={() => toggleFavorite(row.id, val)} className="p-0 text-decoration-none">
          {val ? '⭐' : '☆'}
        </Button>
      ),
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-primary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (!user) return <div className="text-center mt-5">Please log in to access your journal.</div>;

  if (loading) {
    return (
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <LoadingSkeleton type="avatar" />
        </div>
        <LoadingSkeleton type="card" lines={6} />
      </Container>
    );
  }

  if (error) return <ErrorState title="Error loading journal" description={error} onRetry={fetchEntries} />;

  return (
    <Container fluid className="px-3 px-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Journal</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="primary" onClick={() => { setEditingEntry(null); setFormData({ title: '', content: '', mood_at_entry: '', entry_type: 'free', is_favorite: false }); setShowEditModal(true); }}>
            + New Entry
          </Button>
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="mb-3 g-2 align-items-end">
            <Col md={4}>
              <Input
                label="Search Entries"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, content, or type..."
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

      {filteredEntries.length === 0 && !appliedSearch && entries.length === 0 ? (
        <EmptyState icon="📝" title="No journal entries yet" description="Start writing to reflect and grow." actionText="Write Entry" onAction={() => { setEditingEntry(null); setFormData({ title: '', content: '', mood_at_entry: '', entry_type: 'free', is_favorite: false }); setShowEditModal(true); }} />
      ) : filteredEntries.length === 0 && appliedSearch ? (
        <p className="text-muted text-center">No entries match your search.</p>
      ) : (
        <DataTable columns={columns} data={filteredEntries} keyField="id" />
      )}

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingEntry ? 'Edit Entry' : 'New Entry'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <Textarea label="Content" name="content" rows={5} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
            <Row>
              <Col sm={4}>
                <Select label="Mood" name="mood_at_entry" value={formData.mood_at_entry} options={[{ value: '', label: 'Select mood' }, { value: '5', label: '😊 Happy' }, { value: '4', label: '🙂 Okay' }, { value: '3', label: '😐 Neutral' }, { value: '2', label: '😔 Sad' }, { value: '1', label: '😭 Overwhelmed' }]} onChange={(e) => setFormData({ ...formData, mood_at_entry: e.target.value })} />
              </Col>
              <Col sm={4}>
                <Select label="Entry Type" name="entry_type" value={formData.entry_type} options={[{ value: 'free', label: 'Free Writing' }, { value: 'guided', label: 'Guided Prompt' }, { value: 'gratitude', label: 'Gratitude' }]} onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })} />
              </Col>
              <Col sm={4} className="d-flex align-items-center">
                <Form.Check type="checkbox" label="⭐ Favorite" checked={formData.is_favorite} onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Journal;
