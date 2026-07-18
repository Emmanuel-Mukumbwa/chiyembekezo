import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminCommunity = () => {
  const { showModal } = useModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/community/posts');
      setPosts(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load community posts.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id, current) => {
    try {
      await api.put(`/admin/community/posts/${id}/pin`, { is_pinned: !current });
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to update pin status.');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/community/posts/${id}`);
      fetchPosts();
    } catch (err) {
      showModal('Error', 'Failed to delete post.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Community Posts</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Author</th>
            <th>Anonymous</th>
            <th>Pinned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.title}</td>
              <td>{p.category || 'Uncategorized'}</td>
              <td>{p.is_anonymous ? 'Anonymous' : p.email || 'Unknown'}</td>
              <td>{p.is_anonymous ? '✅' : '❌'}</td>
              <td>{p.is_pinned ? '📌' : ''}</td>
              <td>
                <Button
                  variant={p.is_pinned ? 'outline-warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => togglePin(p.id, p.is_pinned)}
                >
                  {p.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button variant="danger" size="sm" className="ms-1" onClick={() => deletePost(p.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminCommunity;