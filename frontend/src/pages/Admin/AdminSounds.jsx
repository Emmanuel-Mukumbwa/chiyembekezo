import React, { useState, useEffect } from 'react';
import { Container, Spinner, Badge, Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, Input, Select, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const SoundCard = ({ sound, onPreview, onEdit, onDelete }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{sound.icon} {sound.name}</h6>
          <div style={{ width: 20, height: 20, backgroundColor: sound.color, borderRadius: 4, display: 'inline-block' }} />
        </div>
        <Badge bg={sound.is_active ? 'success' : 'secondary'}>{sound.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="d-flex gap-1 mt-3 flex-wrap">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(sound)}>Preview</Button>
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(sound)}>Edit</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(sound.id)}>Delete</Button>
      </div>
    </Card.Body>
  </Card>
);

const AdminSounds = () => {
  const { showModal } = useModal();
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModalItem, setShowModalItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', icon: '', color: '', sort_order: 0, is_active: true, audio_url: '', image_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/wellness/sounds');
      setSounds(res.data);
    } catch (err) {
      setError('Failed to load sounds.');
      showModal('Error', 'Failed to load sounds.');
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
        if (key === 'audio' && formData.audio) formDataToSend.append('audio', formData.audio);
        else if (key === 'image' && formData.image) formDataToSend.append('image', formData.image);
        else if (key === 'is_active') formDataToSend.append(key, formData[key] ? 1 : 0);
        else if (formData[key] !== null && formData[key] !== '') formDataToSend.append(key, formData[key]);
      });
      if (editingItem) {
        await api.put(`/admin/wellness/sounds/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showModal('Success', 'Sound updated.');
      } else {
        await api.post('/admin/wellness/sounds', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showModal('Success', 'Sound created.');
      }
      setShowModalItem(false);
      setEditingItem(null);
      setFormData({ name: '', icon: '', color: '', sort_order: 0, is_active: true, audio_url: '', image_url: '' });
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
    showModal('Confirm Delete', 'Are you sure?', async () => {
      try {
        await api.delete(`/admin/wellness/sounds/${id}`);
        showModal('Success', 'Sound deleted.');
        fetchData();
      } catch (err) {
        showModal('Error', 'Failed to delete.');
      }
    });
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      icon: item.icon || '',
      color: item.color || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1,
      audio_url: item.audio_url || '',
      image_url: item.image_url || '',
    });
    setSelectedAudioFile(null);
    setSelectedImageFile(null);
    setShowModalItem(true);
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'name', label: 'Name' },
    { field: 'icon', label: 'Icon', render: (val) => <span style={{ fontSize: '1.5rem' }}>{val}</span> },
    { field: 'color', label: 'Color', render: (val) => <div style={{ width: '20px', height: '20px', backgroundColor: val, borderRadius: '4px' }} /> },
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
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
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

  if (error) return <ErrorState title="Error loading sounds" description={error} onRetry={fetchData} />;

  return (
    <>
      <Container fluid className="px-3 px-sm-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Relaxation Sounds</h4>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', icon: '', color: '', sort_order: 0, is_active: true, audio_url: '', image_url: '' });
              setSelectedAudioFile(null);
              setSelectedImageFile(null);
              setShowModalItem(true);
            }}>+ New Sound</Button>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
        </div>

        {sounds.length === 0 ? (
          <EmptyState icon="🌧" title="No sounds" description="Create your first relaxation sound." />
        ) : (
          <>
            <div className="d-none d-md-block">
              <DataTable columns={columns} data={sounds} keyField="id" />
            </div>
            <div className="d-md-none">
              {sounds.map(s => (
                <SoundCard key={s.id} sound={s} onPreview={setPreviewItem} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        <Modal show={showModalItem} onHide={() => setShowModalItem(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingItem ? 'Edit Sound' : 'New Sound'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Input label="Name *" name="name" value={formData.name} onChange={handleChange} required />
                </Col>
                <Col md={6}>
                  <Input label="Icon (emoji)" name="icon" value={formData.icon} onChange={handleChange} placeholder="e.g., 🌧" />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Input label="Color (hex)" name="color" value={formData.color} onChange={handleChange} placeholder="#4a90d9" />
                </Col>
                <Col md={6}>
                  <Input label="Sort Order" name="sort_order" type="number" value={formData.sort_order} onChange={handleChange} />
                </Col>
              </Row>
              <Form.Group>
                <Form.Check type="checkbox" label="Active" checked={formData.is_active} onChange={handleChange} />
              </Form.Group>
              <hr />
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Audio File</Form.Label>
                    <Form.Control type="file" id="audio-upload" name="audio" onChange={handleChange} accept="audio/*" />
                    {selectedAudioFile && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="text-success">📎 {selectedAudioFile.name}</span>
                        <Button variant="outline-danger" size="sm" onClick={() => clearFile('audio')}>Remove</Button>
                      </div>
                    )}
                    {formData.audio_url && !selectedAudioFile && (
                      <div className="mt-2">
                        <audio controls style={{ width: '100%' }}><source src={formData.audio_url} /></audio>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Image (optional)</Form.Label>
                    <Form.Control type="file" id="image-upload" name="image" onChange={handleChange} accept="image/*" />
                    {selectedImageFile && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <span className="text-success">📎 {selectedImageFile.name}</span>
                        <Button variant="outline-danger" size="sm" onClick={() => clearFile('image')}>Remove</Button>
                      </div>
                    )}
                    {formData.image_url && !selectedImageFile && (
                      <div className="mt-2">
                        <img src={formData.image_url} alt="Sound" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }} />
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
          <Modal.Title>{previewItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              {previewItem.icon && <div style={{ fontSize: '2rem' }}>{previewItem.icon}</div>}
              {previewItem.color && <div style={{ width: '30px', height: '30px', backgroundColor: previewItem.color, borderRadius: '4px', marginBottom: '10px' }} />}
              {previewItem.audio_url && (
                <div className="mb-3">
                  <audio controls style={{ width: '100%' }}><source src={previewItem.audio_url} /></audio>
                </div>
              )}
              {previewItem.image_url && (
                <img src={previewItem.image_url} alt="Sound" style={{ maxWidth: '200px', borderRadius: '8px' }} />
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

export default AdminSounds;
