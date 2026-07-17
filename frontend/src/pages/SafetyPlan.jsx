import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, InputGroup, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const Resources = () => {
  const { showModal } = useModal();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/resources/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page: pagination.currentPage,
        limit: pagination.limit,
      });
      const res = await api.get(`/resources?${params}`);
      setResources(res.data.resources);
      setPagination({
        currentPage: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
        limit: res.data.limit,
      });
    } catch (err) {
      showModal('Error', 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '' });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
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
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Mental Wellness Resources</h1>
          <p className="hero-subtitle">Explore videos, podcasts, guides, and interactive content.</p>
        </Container>
      </section>

      <Container className="my-4">
        {/* Filters */}
        <Card className="feature-card p-3 mb-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label>Search</Form.Label>
              <Form.Control
                placeholder="Search resources..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
              />
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
            <Col md={2}>
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button variant="primary" onClick={fetchResources}>Search</Button>
              <Button variant="outline-secondary" onClick={clearFilters}>Clear</Button>
            </Col>
            <Col md={2} className="text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Results Count */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">Showing {resources.length} of {pagination.total} resources</span>
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <p className="text-muted text-center">No resources found. Try adjusting your filters.</p>
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
                    <div className="d-flex flex-wrap gap-2 small text-muted">
                      {res.duration_minutes && <span>⏱ {res.duration_minutes} min</span>}
                      {res.author && <span>✍️ {res.author}</span>}
                      <span>👁 {res.view_count}</span>
                    </div>
                    <Button
                      as={Link}
                      to={`/resources/${res.id}`}
                      variant="outline-primary"
                      size="sm"
                      className="mt-3 w-100"
                    >
                      View Resource
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          // List view
          <div>
            {resources.map(res => (
              <Card key={res.id} className="feature-card mb-2">
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between">
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{typeIcon(res.type)}</span>
                    <strong>{res.title}</strong>
                    <span className="text-muted ms-2 small">— {res.category_name || 'Uncategorized'}</span>
                    <div className="small text-muted">{res.description}</div>
                  </div>
                  <div>
                    <Badge bg={typeBadgeVariant(res.type)} className="me-2">{res.type}</Badge>
                    <Button as={Link} to={`/resources/${res.id}`} variant="outline-primary" size="sm">
                      View
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              />
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === pagination.currentPage}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </main>
  );
};

export default Resources;