import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button, Modal } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, LoadingSkeleton, SearchBar } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminCommunity = () => {
  const { showModal } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');

  // Preview state
  const [previewPost, setPreviewPost] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [search]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/community/posts', { params: { search } });
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load community posts.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/community/posts/${id}/pin`, { is_pinned: !current });
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to update pin status.');
    } finally {
      setActionLoading(null);
    }
  };

  const deletePost = async (id) => {
    showModal('Confirm Delete', 'Are you sure you want to delete this post?', async () => {
      setActionLoading(id);
      try {
        await api.delete(`/admin/community/posts/${id}`);
        showModal('Success', 'Post deleted.');
        fetchPosts();
      } catch (err) {
        showModal('Error', 'Failed to delete post.');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const openPreview = async (postId) => {
    setPreviewLoading(true);
    try {
      const res = await api.get(`/admin/community/posts/${postId}`);
      setPreviewPost(res.data);
    } catch (err) {
      showModal('Error', 'Could not load post details.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => setPreviewPost(null);

  const deleteComment = async (commentId) => {
    showModal('Confirm Delete', 'Delete this comment?', async () => {
      try {
        await api.delete(`/admin/community/comments/${commentId}`);
        // Refresh the preview
        openPreview(previewPost.post.id);
      } catch (err) {
        showModal('Error', 'Failed to delete comment.');
      }
    });
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category', render: (val) => val || 'Uncategorized' },
    {
      field: 'is_anonymous',
      label: 'Anonymous',
      render: (val) => val ? <span className="text-success">✔</span> : <span className="text-muted">✘</span>,
    },
    {
      field: 'is_pinned',
      label: 'Pinned',
      render: (val) => val ? '📌' : '',
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => openPreview(row.id)}>
            Preview
          </Button>
          <Button
            variant={row.is_pinned ? 'outline-warning' : 'outline-secondary'}
            size="sm"
            onClick={() => togglePin(row.id, row.is_pinned)}
            disabled={actionLoading === row.id}
          >
            {actionLoading === row.id ? <Spinner animation="border" size="sm" /> : row.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => deletePost(row.id)}
            disabled={actionLoading === row.id}
          >
            {actionLoading === row.id ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Community Posts</h4>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
        <LoadingSkeleton type="list" />
      </Container>
    );
  }

  if (error) return <ErrorState title="Error" description={error} onRetry={fetchPosts} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Community Posts</h4>
          <div className="d-flex gap-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={fetchPosts}
              placeholder="Search posts..."
            />
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
        </div>
        <DataTable columns={columns} data={posts} keyField="id" />
      </Container>

      {/* Preview Modal */}
      <Modal show={!!previewPost} onHide={closePreview} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Post Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewLoading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : previewPost && (
            <div>
              <h5>{previewPost.post.title}</h5>
              <p className="text-muted">
                by {previewPost.post.author_name} | {new Date(previewPost.post.created_at).toLocaleDateString()}
                {previewPost.post.is_anonymous && ' (Anonymous)'}
              </p>
              <div className="border p-3 bg-light mb-3">{previewPost.post.content}</div>
              <p><strong>Category:</strong> {previewPost.post.category_name}</p>
              <p><strong>Views:</strong> {previewPost.post.view_count}</p>
              <hr />
              <h6>Reactions</h6>
              {Object.keys(previewPost.reaction_counts).length === 0 ? (
                <p className="text-muted">No reactions yet.</p>
              ) : (
                <div className="mb-3">
                  {Object.entries(previewPost.reaction_counts).map(([type, count]) => (
                    <Badge bg="light" text="dark" className="me-1" key={type}>
                      {type} {count}
                    </Badge>
                  ))}
                </div>
              )}
              <hr />
              <h6>Comments ({previewPost.comments.length})</h6>
              {previewPost.comments.length === 0 ? (
                <p className="text-muted">No comments.</p>
              ) : (
                previewPost.comments.map(comment => (
                  <div key={comment.id} className="border rounded p-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{comment.author_name}</strong>
                        {comment.is_anonymous && ' (Anon)'} · {new Date(comment.created_at).toLocaleString()}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteComment(comment.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                    <p className="mt-1 mb-0">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePreview}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminCommunity;
