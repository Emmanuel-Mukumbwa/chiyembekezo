import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const ResourceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showModal } = useModal();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchResource();
    if (user) {
      fetchUserProgress();
    }
  }, [id, user]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resources/${id}`);
      setResource(res.data);
    } catch (err) {
      showModal('Error', 'Resource not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const res = await api.get('/resources/user/course-progress');
      const progress = res.data[id];
      if (progress) {
        setCourseProgress(progress.progress_percent || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateProgress = async (progress) => {
    try {
      await api.post(`/resources/user/course-progress/${id}`, { progress });
      setCourseProgress(progress);
      if (progress >= 100) {
        showModal('🎉 Course Complete!', 'Congratulations on completing this course!');
      }
    } catch (err) {
      showModal('Error', 'Failed to update progress.');
    }
  };

  const toggleLike = async () => {
    try {
      await api.post(`/resources/${id}/like`, { action: isLiked ? 'unlike' : 'like' });
      setIsLiked(!isLiked);
      setResource({ ...resource, like_count: resource.like_count + (isLiked ? -1 : 1) });
    } catch (err) {
      showModal('Error', 'Failed to like.');
    }
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

  if (!resource) {
    return (
      <Container className="my-5 text-center">
        <h3>Resource not found</h3>
        <Button as={Link} to="/resources">Back to Resources</Button>
      </Container>
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

  return (
    <Container className="my-5">
      <Button as={Link} to="/resources" variant="outline-secondary" className="mb-3">
        ← Back to Resources
      </Button>

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
            {resource.duration_minutes && <p><strong>Duration:</strong> {resource.duration_minutes} minutes</p>}
            <div className="mb-3">
              <strong>Description:</strong>
              <p>{resource.description}</p>
            </div>
            {resource.content && (
              <div className="mb-3">
                <strong>Content:</strong>
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              </div>
            )}

            {resource.url && (
              <Button variant="primary" as="a" href={resource.url} target="_blank">
                {resource.type === 'pdf' ? '📄 Download PDF' :
                 resource.type === 'video' ? '▶️ Watch Video' :
                 resource.type === 'podcast' ? '🎧 Listen Now' : 'Open Resource'}
              </Button>
            )}

            {/* Course Progress */}
            {resource.type === 'course' && user && (
              <div className="mt-4">
                <h6>Your Progress</h6>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${courseProgress}%` }}
                  >
                    {courseProgress}%
                  </div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <Button variant="outline-primary" size="sm" onClick={() => updateProgress(Math.min(courseProgress + 10, 100))}>
                    +10% Progress
                  </Button>
                  <Button variant="outline-success" size="sm" onClick={() => updateProgress(100)}>
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 d-flex gap-3">
              <Button variant="outline-primary" size="sm" onClick={toggleLike}>
                ❤️ {resource.like_count || 0} Likes
              </Button>
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
                    {resource.tags.map((tag, idx) => (
                      <Badge key={idx} bg="secondary">{tag}</Badge>
                    ))}
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