import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, Select, Textarea } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const OrganizationResourceEdit = () => {
  const { id } = useParams();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchCategories();
    fetchResource();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/resources/categories');
      setCategories(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load categories.');
    }
  };

  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/organization/resources/${id}`);
      const data = res.data;
      setFormData({
        title: data.title || '',
        type: data.type || 'article',
        category_id: data.category_id || '',
        description: data.description || '',
        content: data.content || '',
        author: data.author || '',
        tags: data.tags ? data.tags.join(', ') : '',
        url: data.url || '',
        is_published: !!data.is_published,
        duration_minutes: data.duration_minutes || '',
        file: null,
      });
    } catch (err) {
      showModal('Error', 'Failed to load resource.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
          formDataToSend.append('tags', formData.tags.split(',').map(t => t.trim()));
        } else if (key === 'is_published') {
          formDataToSend.append('is_published', formData.is_published ? 1 : 0);
        } else if (key !== 'file' && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      await api.put(`/organization/resources/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showModal('Success', 'Resource updated successfully.');
      navigate('/organization/resources');
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to update resource.');
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

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Edit Organization Resource</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Card className="p-4">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Col>
            <Col md={6}>
              <Select
                label="Type"
                name="type"
                value={formData.type}
                options={typeOptions}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Select
                label="Category"
                name="category_id"
                value={formData.category_id}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Input
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Textarea
            label="Description"
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
          />
          <Textarea
            label="Content (full text)"
            name="content"
            rows={5}
            value={formData.content}
            onChange={handleChange}
          />
          <Row>
            <Col md={6}>
              <Input
                label="URL (external link or Cloudinary URL)"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com/resource"
              />
            </Col>
            <Col md={6}>
              <Input
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleChange}
                placeholder="e.g., 5"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Input
                label="Tags (comma separated)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., anxiety, coping, mindfulness"
              />
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Upload File (PDF, image, audio, video)</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Upload a new file to replace the current one (if any).
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Publish immediately"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
            />
          </Form.Group>
          <div className="d-flex gap-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Resource'}
            </Button>
            <Button variant="outline-secondary" as={Link} to="/organization/resources">Cancel</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default OrganizationResourceEdit;
