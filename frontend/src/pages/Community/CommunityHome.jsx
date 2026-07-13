import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
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
  const [filters, setFilters] = useState({ category: '', sort: 'recent' });
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', categoryId: '', isAnonymous: true });

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/community/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/community/posts?${params}`);
      setPinnedPosts(res.data.pinned || []);
      setPosts(res.data.posts || []);
    } catch (err) {
      showModal('Error', 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/posts', newPost);
      showModal('Success', 'Post created!');
      setShowNewPost(false);
      setNewPost({ title: '', content: '', categoryId: '', isAnonymous: true });
      fetchPosts();
    } catch (err) {
      showModal('Error', err.response?.data?.error || 'Failed to create post.');
    }
  };

  if (loading && posts.length === 0) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <Container className="my-5">
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
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Sort By</Form.Label>
            <Form.Select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="most_commented">Most Discussed</option>
            </Form.Select>
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
                <Link to={`/community/post/${post.id}`} style={{ textDecoration: 'none' }}>
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
        <p className="text-muted">No posts yet. Be the first!</p>
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
      {showNewPost && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowNewPost(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Post</h5>
                <button className="btn-close" onClick={() => setShowNewPost(false)}></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="modal-body">
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      required
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      required
                      value={newPost.categoryId}
                      onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      required
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Post anonymously"
                      checked={newPost.isAnonymous}
                      onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                    />
                  </Form.Group>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setShowNewPost(false)}>Cancel</Button>
                  <Button variant="primary" type="submit">Post</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CommunityHome;