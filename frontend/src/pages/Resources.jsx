import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const resourcesData = [
  {
    id: 1,
    title: 'Managing Anxiety',
    category: 'Anxiety',
    type: 'article',
    excerpt: 'Learn practical techniques to reduce anxiety and regain calm.',
    readTime: '5 min',
    image: '🧠',
  },
  {
    id: 2,
    title: 'Understanding Depression',
    category: 'Depression',
    type: 'article',
    excerpt: 'What depression looks like and how to get help.',
    readTime: '7 min',
    image: '💙',
  },
  {
    id: 3,
    title: 'Better Sleep Habits',
    category: 'Sleep',
    type: 'video',
    excerpt: 'A guided meditation for restful sleep.',
    readTime: '10 min',
    image: '😴',
  },
  {
    id: 4,
    title: 'Stress Management Workbook',
    category: 'Stress',
    type: 'pdf',
    excerpt: 'Downloadable PDF with exercises to manage stress.',
    readTime: '15 min',
    image: '📘',
  },
  {
    id: 5,
    title: 'Parenting Teens with Anxiety',
    category: 'Parenting',
    type: 'article',
    excerpt: 'Tips for supporting your teenager through anxiety.',
    readTime: '6 min',
    image: '👨‍👩‍👧',
  },
  {
    id: 6,
    title: 'Exam Stress Relief',
    category: 'Students',
    type: 'video',
    excerpt: 'Quick breathing exercise for students during exams.',
    readTime: '4 min',
    image: '🎓',
  },
];

const categories = ['All', 'Anxiety', 'Depression', 'Sleep', 'Stress', 'Parenting', 'Students', 'Self Care', 'Workplace', 'Financial Stress'];

const Resources = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const filtered = resourcesData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                           item.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main>
      {/* Hero */}
      <section className="hero-section text-center">
        <Container>
          <h1 className="hero-title">Mental Wellness Resources</h1>
          <p className="hero-subtitle">Explore articles, videos, and tools to support your journey.</p>
          <InputGroup className="mt-4 mx-auto" style={{ maxWidth: '500px' }}>
            <Form.Control
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="primary">Search</Button>
          </InputGroup>
        </Container>
      </section>

      {/* Categories */}
      <Container className="my-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
          </Button>
        </div>
      </Container>

      {/* Results */}
      <Container className="my-4">
        {filtered.length === 0 ? (
          <p className="text-center text-muted">No resources found. Try a different search.</p>
        ) : viewMode === 'grid' ? (
          <Row>
            {filtered.map(item => (
              <Col md={4} sm={6} key={item.id} className="mb-3">
                <Card className="feature-card h-100">
                  <Card.Body>
                    <div className="text-center" style={{ fontSize: '3rem' }}>{item.image}</div>
                    <Card.Title className="mt-2">{item.title}</Card.Title>
                    <div className="mb-2">
                      <Badge bg="secondary">{item.category}</Badge>{' '}
                      <Badge bg="light" text="dark">{item.type}</Badge>
                    </div>
                    <Card.Text className="text-muted small">{item.excerpt}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">⏱ {item.readTime}</span>
                      <Button variant="outline-primary" size="sm">Read</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          // List view
          <div>
            {filtered.map(item => (
              <Card className="mb-2 feature-card" key={item.id}>
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-between">
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{item.image}</span>
                    <strong>{item.title}</strong>
                    <span className="text-muted ms-2 small">— {item.category}</span>
                  </div>
                  <div>
                    <Badge bg="secondary" className="me-2">{item.type}</Badge>
                    <span className="text-muted small me-2">⏱ {item.readTime}</span>
                    <Button variant="outline-primary" size="sm">Read</Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Interactive Tools & Crisis */}
      <Container className="my-5">
        <Row>
          <Col md={6}>
            <Card className="feature-card p-3">
              <h5>🧘 Interactive Tools</h5>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-primary" as={Link} to="/mood">Mood Tracker</Button>
                <Button variant="outline-primary" as={Link} to="/assessments">Assessments</Button>
                <Button variant="outline-primary" as={Link} to="/breathing">Breathing Exercise</Button>
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="feature-card p-3 border-danger">
              <h5>🚨 Crisis Resources</h5>
              <p className="small">If you need immediate help, please use the Emergency button at the top of every page.</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Resources;