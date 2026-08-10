import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { Button, ErrorState, LoadingSkeleton } from '../components/ui';
import api from '../services/api';

const ResourceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showModal } = useModal();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/resources/${id}`);
        setResource(res.data);
        // Fetch user progress if logged in
        if (user && res.data.type === 'course') {
          try {
            const progressRes = await api.get('/resources/user/course-progress');
            if (progressRes.data[res.data.id]) {
              setCourseProgress(progressRes.data[res.data.id]);
            }
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        setError('Resource not found.');
        showModal('Error', 'Resource not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, user]);

  const updateProgress = async (progress) => {
    try {
      await api.post(`/resources/user/course-progress/${id}`, { progress });
      setCourseProgress(progress);
      if (progress >= 100) {
        showModal('🎉 Course Complete!', 'Congratulations!');
      }
    } catch (err) {
      showModal('Error', 'Failed to update progress.');
    }
  };

  const toggleLike = async () => {
    try {
      await api.post(`/resources/${id}/like`, { action: isLiked ? 'unlike' : 'like' });
      setIsLiked(!isLiked);
      setResource(prev => ({ ...prev, like_count: prev.like_count + (isLiked ? -1 : 1) }));
    } catch (err) {
      showModal('Error', 'Failed to like.');
    }
  };

  if (loading) {
    return (
      <Container className="my-5">
        <LoadingSkeleton type="article" lines={8} />
        <Row className="mt-4">
          <Col md={4}>
            <LoadingSkeleton type="card" lines={5} />
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !resource) {
    return (
      <ErrorState
        title="Resource not found"
        description="The resource you are looking for does not exist or has been removed."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const typeIcons = {
    video: '🎬',
    podcast: '🎧',
    infographic: '📊',
    pdf: '📄',
    worksheet: '📝',
    course: '📚',
    'interactive-lesson': '🎯',
  };

  const renderMedia = () => {
    if (!resource.url) return null;
    const { type, url } = resource;
    if (type === 'video') {
      return (
        <div className="mb-3">
          <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}>
            <source src={url} type="video/mp4" />
            Your browser does not support video.
          </video>
        </div>
      );
    } else if (type === 'podcast') {
      return (
        <div className="mb-3">
          <audio controls style={{ width: '100%' }}>
            <source src={url} type="audio/mpeg" />
            Your browser does not support audio.
          </audio>
        </div>
      );
    } else if (type === 'pdf') {
      return (
        <div className="mb-3">
          <iframe src={url} style={{ width: '100%', height: '500px' }} title="PDF preview" />
        </div>
      );
    } else {
      return (
        <Button variant="primary" as="a" href={url} target="_blank" rel="noopener noreferrer">
          Open Resource
        </Button>
      );
    }
  };

  return (
    <Container className="my-5">
      <Button as={Link} to="/resources" variant="outline-secondary" className="mb-3">← Back to Resources</Button>
      <Row>
        <Col md={8}>
          <Card className="feature-card p-4">
            <div style={{ fontSize: '4rem' }}>{typeIcons[resource.type] || '📁'}</div>
            <h1 className="mt-2">{resource.title}</h1>
            <div className="mb-3">
              <Badge bg={resource.type === 'video' ? 'danger' : 'secondary'}>{resource.type}</Badge>
              {resource.category_name && <Badge bg="light" text="dark" className="ms-1">{resource.category_name}</Badge>}
            </div>
            {resource.author && <p><strong>Author:</strong> {resource.author}</p>}
            {resource.duration_minutes && <p><strong>Duration:</strong> {resource.duration_minutes} min</p>}
            <div className="mb-3"><strong>Description:</strong><p>{resource.description}</p></div>
            {renderMedia()}
            {resource.content && (
              <div className="mb-3">
                <strong>Content:</strong>
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              </div>
            )}
            {resource.type === 'course' && user && (
              <div className="mt-4">
                <h6>Your Progress</h6>
                <div className="progress mb-2">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${courseProgress}%` }}
                    role="progressbar"
                  >
                    {courseProgress}%
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => updateProgress(Math.min(courseProgress + 10, 100))}>+10%</Button>
                  <Button variant="outline-success" size="sm" onClick={() => updateProgress(100)}>Mark Complete</Button>
                </div>
              </div>
            )}
            <div className="mt-3 d-flex gap-3">
              <Button variant="outline-primary" size="sm" onClick={toggleLike}>❤️ {resource.like_count || 0}</Button>
              <span className="text-muted small">👁 {resource.view_count} views</span>
            </div>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="feature-card p-3 mb-3">
            <h6>Resource Info</h6>
            <ul className="list-unstyled small">
              <li><strong>Type:</strong> {resource.type}</li>
              <li><strong>Category:</strong> {resource.category_name || 'Uncategorized'}</li>
              {resource.file_size && <li><strong>Size:</strong> {resource.file_size}</li>}
              {resource.tags && resource.tags.length > 0 && (
                <li>
                  <strong>Tags:</strong>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {resource.tags.map((tag, idx) => <Badge key={idx} bg="secondary">{tag}</Badge>)}
                  </div>
                </li>
              )}
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResourceDetail;
