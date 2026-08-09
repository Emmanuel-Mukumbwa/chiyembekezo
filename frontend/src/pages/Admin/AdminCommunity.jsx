import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminCommunity = () => {
  const { showModal } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/community/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load community posts.');
      showModal('Error', 'Failed to load community posts.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/community/posts/${id}/pin`, { is_pinned: !current });
      showModal('Success', 'Pin status updated.');
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to update pin status.');
    } finally {
      setActionLoading(null);
    }
  };

  const deletePost = async (id) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this post? This action cannot be undone.',
      async () => {
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
      }
    );
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'category', label: 'Category', render: (val) => val || 'Uncategorized' },
    { field: 'author', label: 'Author', render: (val, row) => row.is_anonymous ? 'Anonymous' : row.email || 'Unknown' },
    { field: 'is_anonymous', label: 'Anonymous', render: (val) => val ? '✅' : '❌' },
    { field: 'is_pinned', label: 'Pinned', render: (val) => val ? '📌' : '' },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const isProcessing = actionLoading === row.id;
        return (
          <div className="d-flex gap-1">
            <Button
              variant={row.is_pinned ? 'outline-warning' : 'outline-secondary'}
              size="sm"
              onClick={() => togglePin(row.id, row.is_pinned)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : (row.is_pinned ? 'Unpin' : 'Pin')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deletePost(row.id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : 'Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Community Posts</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading posts" description={error} onRetry={fetchPosts} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Community Posts</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <DataTable columns={columns} data={posts} keyField="id" />
    </Container>
  );
};

export default AdminCommunity;
