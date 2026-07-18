import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminArticles = () => {
  const { showModal } = useModal();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/articles');
      setArticles(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id, current) => {
    try {
      await api.put(`/admin/articles/${id}/publish`, { is_published: !current });
      fetchArticles();
    } catch (err) {
      showModal('Error', 'Failed to update article.');
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/admin/articles/${id}`);
      fetchArticles();
    } catch (err) {
      showModal('Error', 'Failed to delete article.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Articles</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Views</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.title}</td>
              <td>{a.category || 'Uncategorized'}</td>
              <td>{a.view_count || 0}</td>
              <td>
                {a.is_published ? (
                  <Badge bg="success">Published</Badge>
                ) : (
                  <Badge bg="secondary">Draft</Badge>
                )}
              </td>
              <td>
                <Button
                  variant={a.is_published ? 'outline-secondary' : 'outline-primary'}
                  size="sm"
                  onClick={() => togglePublish(a.id, a.is_published)}
                >
                  {a.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="danger" size="sm" className="ms-1" onClick={() => deleteArticle(a.id)}>
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

export default AdminArticles;