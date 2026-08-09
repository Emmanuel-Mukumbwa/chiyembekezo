import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { Button, Input, Select, Textarea, EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const CommunityHome = () => {
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', sort: 'recent' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', categoryId: '', isAnonymous: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/community/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/community/posts?${params}`);
      setPinnedPosts(res.data.pinned || []);
      setPosts(res.data.posts || []);
    } catch (err) {
      setError('Failed to load posts.');
      showModal('Error', 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/community/posts', newPost);
      showModal('Success', 'Post created!');
      setShowNewPost(false);
      setNewPost({ title: '', content: '', categoryId: '', isAnonymous: true });
      fetchPosts();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

if (loading && posts.length === 0) {
    return (
      <Container fluid className="px-4 my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <LoadingSkeleton type="article" lines={2} className="flex-grow-1" />
        </div>
        <Row>
          {[...Array(3)].map((_, i) => (
            <Col md={4} key={i} className="mb-3">
              <LoadingSkeleton type="card" lines={4} />
            </Col>
          ))}
        </Row>
        <LoadingSkeleton type="list" />
      </Container>
    );
  }
  if (error) return <ErrorState title="Error loading community" description={error} onRetry={fetchPosts} />;

  return (
    <Container fluid className="px-4 my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community</h2>
        {user && (
          <Button variant="primary" onClick={() => setShowNewPost(true)}>
            + New Post
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="feature-card p-3 mb-4">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Select
              label="Category"
              name="category"
              value={filters.category}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name })),
              ]}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Select
              label="Sort By"
              name="sort"
              value={filters.sort}
              options={[
                { value: 'recent', label: 'Most Recent' },
                { value: 'popular', label: 'Most Popular' },
                { value: 'most_commented', label: 'Most Discussed' },
              ]}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            />
          </Col>
          <Col md={2}>
            <Button variant="primary" onClick={fetchPosts}>Apply</Button>
          </Col>
        </Row>
      </Card>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="mb-4">
          <h5 className="text-muted">📌 Pinned</h5>
          {pinnedPosts.map(post => (
            <Card key={post.id} className="feature-card mb-2">
              <Card.Body>
                <Link to={`/community/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h6>{post.title}</h6>
                  <div className="small text-muted">
                    {post.author_name} · {formatDistanceToNow(new Date(post.created_at))} ago
                    {post.category_name && <Badge bg="secondary" className="ms-2">{post.category_name}</Badge>}
                  </div>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No posts yet"
          description="Be the first to start a conversation."
          actionText={user ? 'Create Post' : 'Login to Post'}
          onAction={() => user ? setShowNewPost(true) : navigate('/login')}
        />
      ) : (
        posts.map(post => (
          <Card key={post.id} className="feature-card mb-3">
            <Card.Body>
              <Link to={`/community/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h5>{post.title}</h5>
                <div className="small text-muted mb-2">
                  {post.author_name} · {formatDistanceToNow(new Date(post.created_at))} ago
                  {post.category_name && <Badge bg="secondary" className="ms-2">{post.category_name}</Badge>}
                </div>
                <div className="text-muted small">{post.content.substring(0, 200)}...</div>
                <div className="mt-2 small text-muted">
                  💬 {post.comment_count} comments · ❤️ {post.reaction_count || 0} reactions
                </div>
              </Link>
            </Card.Body>
          </Card>
        ))
      )}

      {/* New Post Modal */}
      <Modal show={showNewPost} onHide={() => setShowNewPost(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Post</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleCreatePost}>
          <Modal.Body>
            <Input
              label="Title"
              name="title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              required
            />
            <Select
              label="Category"
              name="categoryId"
              value={newPost.categoryId}
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
              required
            />
            <Textarea
              label="Content"
              name="content"
              rows={5}
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              required
            />
            <Form.Check
              type="checkbox"
              label="Post anonymously"
              checked={newPost.isAnonymous}
              onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewPost(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
};

export default CommunityHome;
