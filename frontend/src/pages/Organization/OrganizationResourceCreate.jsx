import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, Select, Textarea } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const OrganizationResourceCreate = () => {
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'article',
    category_id: '',
    description: '',
    content: '',
    author: '',
    tags: '',
    url: '',
    is_published: false,
    duration_minutes: '',
    file: null,
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/resources/categories');
      setCategories(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setSelectedFile(file);
        setFormData(prev => ({ ...prev, file }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, file: null }));
    const fileInput = document.getElementById('org-file-upload-create');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData.file) {
          formDataToSend.append('file', formData.file);
        } else if (key === 'tags' && formData.tags) {
          formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
        } else if (key === 'is_published') {
          formDataToSend.append(key, formData[key] ? 1 : 0);
        } else if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      await api.post('/organization/resources', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showModal('Success', 'Resource created.');
      navigate('/organization/resources');
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to create resource.');
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'pdf', label: 'PDF' },
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'course', label: 'Course' },
    { value: 'interactive-lesson', label: 'Interactive Lesson' },
  ];

  const showFileUpload = ['video', 'podcast', 'pdf', 'worksheet', 'interactive-lesson'].includes(formData.type);
  const showContent = ['article', 'course'].includes(formData.type);

  const renderFilePreview = () => {
    if (!selectedFile) return null;
    const objectUrl = URL.createObjectURL(selectedFile);
    if (selectedFile.type.startsWith('video/')) {
      return <video controls style={{ maxWidth: '100%', maxHeight: '200px' }}><source src={objectUrl} type={selectedFile.type} /></video>;
    } else if (selectedFile.type.startsWith('audio/')) {
      return <audio controls style={{ width: '100%' }}><source src={objectUrl} type={selectedFile.type} /></audio>;
    } else if (selectedFile.type === 'application/pdf') {
      return <iframe src={objectUrl} style={{ width: '100%', height: '300px' }} title="PDF preview" />;
    } else if (selectedFile.type.startsWith('image/')) {
      return <img src={objectUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />;
    }
    return null;
  };

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" as={Link} to="/organization/resources">← Back</Button>
          <h4 className="mb-0">Create Resource</h4>
        </div>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Card className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col xs={12} md={6}>
              <Input label="Title *" name="title" value={formData.title} onChange={handleChange} required />
            </Col>
            <Col xs={12} md={6}>
              <Select label="Type *" name="type" value={formData.type} options={typeOptions} onChange={handleChange} required />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              {categoriesLoading ? <Spinner animation="border" size="sm" /> : (
                <Select label="Category" name="category_id" value={formData.category_id} options={categories.map(c => ({ value: c.id, label: c.name }))} onChange={handleChange} />
              )}
            </Col>
            <Col xs={12} md={6}>
              <Input label="Author" name="author" value={formData.author} onChange={handleChange} />
            </Col>
          </Row>
          <Textarea label="Description" name="description" rows={2} value={formData.description} onChange={handleChange} />
          {showContent && (
            <Textarea label="Content" name="content" rows={5} value={formData.content} onChange={handleChange} />
          )}
          <Row>
            <Col xs={12} md={6}>
              <Input label="External URL" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com/resource" />
            </Col>
            <Col xs={12} md={6}>
              <Input label="Duration (minutes)" name="duration_minutes" type="number" value={formData.duration_minutes} onChange={handleChange} placeholder="e.g., 5" />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <Input label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} />
            </Col>
            <Col xs={12} md={6}>
              {showFileUpload ? (
                <Form.Group className="mb-3">
                  <Form.Label>Upload File</Form.Label>
                  <Form.Control
                    type="file"
                    id="org-file-upload-create"
                    name="file"
                    onChange={handleChange}
                    accept={formData.type === 'video' ? 'video/*' : formData.type === 'podcast' ? 'audio/*' : formData.type === 'pdf' ? '.pdf' : '*'}
                  />
                  {selectedFile && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-success">📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        <Button variant="outline-danger" size="sm" onClick={clearFile}>Remove</Button>
                      </div>
                      {renderFilePreview()}
                    </div>
                  )}
                  <Form.Text className="text-muted">Optional – upload a file.</Form.Text>
                </Form.Group>
              ) : (
                <div className="text-muted small mt-2">File upload not needed for this type.</div>
              )}
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Check type="checkbox" label="Publish immediately" checked={formData.is_published} onChange={handleChange} />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Resource'}</Button>
            <Button variant="outline-secondary" as={Link} to="/organization/resources">Cancel</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default OrganizationResourceCreate;
