import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { EmptyState, ErrorState, LoadingSkeleton } from '../components/ui';
import api from '../services/api';

const Resources = () => {
  const { showModal } = useModal();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/resources/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      ['search', 'category', 'type'].forEach(key => {
        if (!params.get(key)) params.delete(key);
      });
      const res = await api.get(`/resources?${params}`);
      setResources(res.data.resources || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 1,
      }));
    } catch (err) {
      setError('Failed to load resources.');
      showModal('Error', 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const typeIcon = (type) => {
    const icons = {
      video: '🎬',
      podcast: '🎧',
      infographic: '📊',
      pdf: '📄',
      worksheet: '📝',
      course: '📚',
      'interactive-lesson': '🎯',
    };
    return icons[type] || '📁';
  };

  const typeBadgeVariant = (type) => {
    const variants = {
      video: 'danger',
      podcast: 'info',
      infographic: 'success',
      pdf: 'warning',
      worksheet: 'primary',
      course: 'dark',
      'interactive-lesson': 'secondary',
    };
    return variants[type] || 'secondary';
  };

  if (loading && resources.length === 0) {
    return (
      <Container className="my-4">
        <Row>
          {[...Array(9)].map((_, i) => (
            <Col md={4} sm={6} key={i} className="mb-3">
              <LoadingSkeleton type="card" withImage lines={4} />
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (error) {
    return <ErrorState title="Error loading resources" description={error} onRetry={fetchResources} />;
  }

  return (
    <main>
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Mental Wellness Resources</h1>
          <p className="hero-subtitle">Explore articles, videos, podcasts, and tools to support your journey.</p>
        </Container>
      </section>

      <Container className="my-4">
        <Card className="feature-card p-3 mb-4">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label>Search</Form.Label>
              <Form.Control
                placeholder="Search resources..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Type</Form.Label>
              <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="pdf">PDF</option>
                <option value="worksheet">Worksheet</option>
                <option value="course">Course</option>
                <option value="interactive-lesson">Interactive Lesson</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button variant="primary" onClick={fetchResources}>Apply</Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setFilters({ search: '', category: '', type: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                Clear
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="ms-auto"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? '📋 List' : '🔲 Grid'}
              </Button>
            </Col>
          </Row>
        </Card>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">Showing {resources.length} of {pagination.total} resources</span>
        </div>

        {resources.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No resources found"
            description="Try adjusting your filters."
            actionText="Clear Filters"
            onAction={() => {
              setFilters({ search: '', category: '', type: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          />
        ) : viewMode === 'grid' ? (
          <Row>
            {resources.map(res => (
              <Col md={4} sm={6} key={res.id} className="mb-3">
                <Card className="feature-card h-100">
                  <Card.Body>
                    <div className="text-center" style={{ fontSize: '3rem' }}>{typeIcon(res.type)}</div>
                    <Card.Title className="mt-2">{res.title}</Card.Title>
                    <div className="mb-2">
                      <Badge bg={typeBadgeVariant(res.type)}>{res.type}</Badge>
                      {res.category_name && <Badge bg="light" text="dark" className="ms-1">{res.category_name}</Badge>}
                    </div>
                    <Card.Text className="text-muted small">{res.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">👁 {res.view_count || 0}</span>
                      <Button as={Link} to={`/resources/${res.id}`} variant="outline-primary" size="sm">View</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div>
            {resources.map(res => (
              <Card className="mb-2 feature-card" key={res.id}>
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between">
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{typeIcon(res.type)}</span>
                    <strong>{res.title}</strong>
                    <span className="text-muted ms-2 small">— {res.category_name || 'Uncategorized'}</span>
                    <div className="small text-muted">{res.description}</div>
                  </div>
                  <div>
                    <Badge bg={typeBadgeVariant(res.type)} className="me-2">{res.type}</Badge>
                    <Button as={Link} to={`/resources/${res.id}`} variant="outline-primary" size="sm">View</Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2">
            <Button variant="outline-secondary" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>Previous</Button>
            <span className="align-self-center">Page {pagination.page} of {pagination.totalPages}</span>
            <Button variant="outline-secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>Next</Button>
          </div>
        )}
      </Container>
    </main>
  );
};

export default Resources;
