import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/community/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments || []);
      setReactions(res.data.reaction_counts || {});
      setUserReaction(res.data.user_reaction || null);
    } catch (err) {
      showModal('Error', 'Post not found.');
      navigate('/community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    // Check bookmark status if logged in
    if (user) {
      // We'll have a separate endpoint or we can check from a list
    }
  }, [id, user]);

  const handleReaction = async (type) => {
    if (!user) {
      showModal('Login Required', 'Please log in to react.');
      return;
    }
    try {
      await api.post(`/community/posts/${id}/reactions`, { reaction: type });
      fetchPost(); // refresh
    } catch (err) {
      showModal('Error', 'Failed to react.');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      showModal('Login Required', 'Please log in to bookmark.');
      return;
    }
    try {
      await api.post(`/community/posts/${id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      showModal('Error', 'Failed to toggle bookmark.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showModal('Login Required', 'Please log in to comment.');
      return;
    }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/community/posts/${id}/comments`, {
        content: commentText,
        isAnonymous: commentAnonymous,
      });
      setCommentText('');
      fetchPost();
    } catch (err) {
      showModal('Error', 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;
  if (!post) return <p>Post not found.</p>;

  return (
    <Container className="my-5">
      <Button as={Link} to="/community" variant="outline-secondary" className="mb-3">← Back to Community</Button>

      <Card className="feature-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2>{post.title}</h2>
            <div className="small text-muted">
              {post.author_name} · {formatDistanceToNow(new Date(post.created_at))} ago
              {post.category_name && <Badge bg="secondary" className="ms-2">{post.category_name}</Badge>}
            </div>
          </div>
          <div className="d-flex gap-2">
            {user && (
              <Button variant="outline-secondary" size="sm" onClick={handleBookmark}>
                {isBookmarked ? '★' : '☆'} Bookmark
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
        <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
          <span>React:</span>
          {['like','love','support','insightful','helpful'].map(type => (
            <Button
              key={type}
              variant={userReaction === type ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handleReaction(type)}
            >
              {type} {reactions[type] || 0}
            </Button>
          ))}
        </div>
      </Card>

      {/* Comments */}
      <h5>Comments ({comments.length})</h5>
      {user && (
        <Card className="feature-card p-3 mb-3">
          <Form onSubmit={handleCommentSubmit}>
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                label="Comment anonymously"
                checked={commentAnonymous}
                onChange={(e) => setCommentAnonymous(e.target.checked)}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Form>
        </Card>
      )}
      {comments.length === 0 ? (
        <p className="text-muted">No comments yet.</p>
      ) : (
        comments.map(c => (
          <Card key={c.id} className="feature-card p-3 mb-2">
            <div className="d-flex justify-content-between">
              <strong>{c.author_name}</strong>
              <span className="text-muted small">{formatDistanceToNow(new Date(c.created_at))} ago</span>
            </div>
            <div className="mt-1">{c.content}</div>
          </Card>
        ))
      )}
    </Container>
  );
};

export default PostDetail;