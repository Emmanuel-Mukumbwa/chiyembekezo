import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import {
  DataTable,
  Input,
  Select,
  Textarea,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminMeditations = () => {
  const { showModal } = useModal();
  const [meditations, setMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalItem, setShowModalItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewItem, setPreviewItem] = useState(null); // Preview modal state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    duration: '',
    description: '',
    narrator: '',
    background_sound: '',
    sort_order: 0,
    is_active: true,
    audio_url: '',
    image_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/wellness/meditations');
      setMeditations(res.data);
    } catch (err) {
      setError('Failed to load meditations.');
      showModal('Error', 'Failed to load meditations.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'audio') {
        setSelectedAudioFile(files[0]);
        setFormData(prev => ({ ...prev, audio: files[0] }));
      } else if (name === 'image') {
        setSelectedImageFile(files[0]);
        setFormData(prev => ({ ...prev, image: files[0] }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearFile = (field) => {
    if (field === 'audio') {
      setSelectedAudioFile(null);
      setFormData(prev => ({ ...prev, audio: null }));
      const input = document.getElementById('audio-upload');
      if (input) input.value = '';
    } else if (field === 'image') {
      setSelectedImageFile(null);
      setFormData(prev => ({ ...prev, image: null }));
      const input = document.getElementById('image-upload');
      if (input) input.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'audio' && formData.audio) {
          formDataToSend.append('audio', formData.audio);
        } else if (key === 'image' && formData.image) {
          formDataToSend.append('image', formData.image);
        } else if (key === 'is_active') {
          formDataToSend.append(key, formData[key] ? 1 : 0);
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (editingItem) {
        await api.put(`/admin/wellness/meditations/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showModal('Success', 'Meditation updated.');
      } else {
        await api.post('/admin/wellness/meditations', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showModal('Success', 'Meditation created.');
      }
      setShowModalItem(false);
      setEditingItem(null);
      setFormData({ title: '', category: '', duration: '', description: '', narrator: '', background_sound: '', sort_order: 0, is_active: true, audio_url: '', image_url: '' });
      setSelectedAudioFile(null);
      setSelectedImageFile(null);
      fetchData();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure you want to delete this meditation?', async () => {
      try {
        await api.delete(`/admin/wellness/meditations/${id}`);
        showModal('Success', 'Meditation deleted.');
        fetchData();
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      duration: item.duration,
      description: item.description || '',
      narrator: item.narrator || '',
      background_sound: item.background_sound || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1,
      audio_url: item.audio_url || '',
      image_url: item.image_url || '',
    });
    setSelectedAudioFile(null);
    setSelectedImageFile(null);
    setShowModalItem(true);
  };

  const openPreview = (item) => {
    setPreviewItem(item);
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category' },
    { field: 'duration', label: 'Duration (min)' },
    { field: 'narrator', label: 'Narrator', render: (val) => val || '-' },
    {
      field: 'is_active',
      label: 'Active',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => openPreview(row)}>Preview</Button>
          <Button variant="outline-primary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <LoadingSkeleton type="avatar" />
        </div>
        <LoadingSkeleton type="list" lines={5} />
      </Container>
    );
  }

  if (error) return <ErrorState title="Error loading meditations" description={error} onRetry={fetchData} />;

  return (
    <>
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Meditations</h4>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => { setEditingItem(null); setFormData({ title: '', category: '', duration: '', description: '', narrator: '', background_sound: '', sort_order: 0, is_active: true, audio_url: '', image_url: '' }); setSelectedAudioFile(null); setSelectedImageFile(null); setShowModalItem(true); }}>+ New Meditation</Button>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
        </div>

        {meditations.length === 0 ? (
          <EmptyState icon="🧘" title="No meditations" description="Create your first meditation." />
        ) : (
          <DataTable columns={columns} data={meditations} keyField="id" />
        )}

        {/* Create/Edit Modal */}
        <Modal show={showModalItem} onHide={() => setShowModalItem(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingItem ? 'Edit Meditation' : 'New Meditation'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Input label="Title *" name="title" value={formData.title} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Input label="Category *" name="category" value={formData.category} onChange={handleChange} required />
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Input label="Duration (minutes) *" name="duration" type="number" value={formData.duration} onChange={handleChange} required />
                </Col>
                <Col md={4}>
                  <Input label="Narrator" name="narrator" value={formData.narrator} onChange={handleChange} />
                </Col>
                <Col md={4}>
                  <Input label="Background Sound" name="background_sound" value={formData.background_sound} onChange={handleChange} />
                </Col>
              </Row>
              <Textarea label="Description" name="description" rows={2} value={formData.description} onChange={handleChange} />
              <Row>
                <Col md={6}>
                  <Input label="Sort Order" name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} />
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      label="Active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Audio File</Form.Label>
                    <Form.Control
                      type="file"
                      id="audio-upload"
                      name="audio"
                      onChange={handleChange}
                      accept="audio/*"
                    />
                    {selectedAudioFile && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="text-success">📎 {selectedAudioFile.name}</span>
                        <Button variant="outline-danger" size="sm" onClick={() => clearFile('audio')}>Remove</Button>
                      </div>
                    )}
                    {formData.audio_url && !selectedAudioFile && (
                      <div className="mt-2">
                        <audio controls style={{ width: '100%' }}>
                          <source src={formData.audio_url} />
                        </audio>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Image (optional)</Form.Label>
                    <Form.Control
                      type="file"
                      id="image-upload"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                    />
                    {selectedImageFile && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="text-success">📎 {selectedImageFile.name}</span>
                        <Button variant="outline-danger" size="sm" onClick={() => clearFile('image')}>Remove</Button>
                      </div>
                    )}
                    {formData.image_url && !selectedImageFile && (
                      <div className="mt-2">
                        <img src={formData.image_url} alt="Meditation" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }} />
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalItem(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>

      {/* Preview Modal */}
      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{previewItem?.title || previewItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              <p><strong>Category:</strong> {previewItem.category}</p>
              <p><strong>Duration:</strong> {previewItem.duration} min</p>
              {previewItem.narrator && <p><strong>Narrator:</strong> {previewItem.narrator}</p>}
              {previewItem.description && <p><strong>Description:</strong> {previewItem.description}</p>}
              {previewItem.background_sound && <p><strong>Background Sound:</strong> {previewItem.background_sound}</p>}
              {previewItem.audio_url && (
                <div className="mb-3">
                  <audio controls style={{ width: '100%' }}>
                    <source src={previewItem.audio_url} />
                  </audio>
                </div>
              )}
              {previewItem.image_url && (
                <img src={previewItem.image_url} alt="Meditation" style={{ maxWidth: '200px', borderRadius: '8px' }} />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewItem(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminMeditations;
