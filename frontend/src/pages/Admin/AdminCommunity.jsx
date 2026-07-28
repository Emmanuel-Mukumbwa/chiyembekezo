import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState } from '../../components/ui';

const AdminCommunity = () => {
  const { showModal } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    try {
      await api.put(`/admin/community/posts/${id}/pin`, { is_pinned: !current });
      showModal('Success', 'Pin status updated.');
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to update pin status.');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/community/posts/${id}`);
      showModal('Success', 'Post deleted.');
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to delete post.');
    }
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
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button
            variant={row.is_pinned ? 'outline-warning' : 'outline-secondary'}
            size="sm"
            onClick={() => togglePin(row.id, row.is_pinned)}
          >
            {row.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deletePost(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading posts" description={error} onRetry={fetchPosts} />;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Community Posts</h4>
      <DataTable columns={columns} data={posts} keyField="id" />
    </Container>
  );
};

export default AdminCommunity;
