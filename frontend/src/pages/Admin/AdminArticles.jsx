import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminArticles = () => {
  const { showModal } = useModal();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // track which row is being processed

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/articles');
      setArticles(res.data);
    } catch (err) {
      setError('Failed to load articles.');
      showModal('Error', 'Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/articles/${id}/publish`, { is_published: !current });
      showModal('Success', 'Article updated.');
      fetchArticles();
    } catch (err) {
      showModal('Error', 'Failed to update article.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteArticle = async (id) => {
    showModal(
      'Confirm Delete',
      'Are you sure you want to delete this article? This action cannot be undone.',
      async () => {
        setActionLoading(id);
        try {
          await api.delete(`/admin/articles/${id}`);
          showModal('Success', 'Article deleted.');
          fetchArticles();
        } catch (err) {
          showModal('Error', 'Failed to delete article.');
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
    { field: 'view_count', label: 'Views' },
    {
      field: 'is_published',
      label: 'Status',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Published' : 'Draft'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const isProcessing = actionLoading === row.id;
        return (
          <div className="d-flex gap-1">
            <Button
              variant={row.is_published ? 'outline-secondary' : 'outline-primary'}
              size="sm"
              onClick={() => togglePublish(row.id, row.is_published)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : (row.is_published ? 'Unpublish' : 'Publish')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteArticle(row.id)}
              disabled={isProcessing}
            >
              {isProcessing ? <Spinner animation="border" size="sm" /> : 'Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading articles" description={error} onRetry={fetchArticles} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Articles</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <DataTable columns={columns} data={articles} keyField="id" />
    </Container>
  );
};

export default AdminArticles;
