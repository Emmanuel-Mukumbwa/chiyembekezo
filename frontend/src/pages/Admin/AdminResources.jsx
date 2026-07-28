import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, DataTable, ErrorState } from '../../components/ui';

const AdminResources = () => {
  const { showModal } = useModal();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/resources');
      setResources(res.data);
    } catch (err) {
      setError('Failed to load resources.');
      showModal('Error', 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id, current) => {
    try {
      await api.put(`/admin/resources/${id}/publish`, { is_published: !current });
      showModal('Success', 'Resource updated.');
      fetchResources();
    } catch (err) {
      showModal('Error', 'Failed to update resource.');
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      showModal('Success', 'Resource deleted.');
      fetchResources();
    } catch (err) {
      showModal('Error', 'Failed to delete resource.');
    }
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'type', label: 'Type' },
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
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button
            variant={row.is_published ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            onClick={() => togglePublish(row.id, row.is_published)}
          >
            {row.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteResource(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading resources" description={error} onRetry={fetchResources} />;

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Resources</h4>
      <DataTable columns={columns} data={resources} keyField="id" />
    </Container>
  );
};

export default AdminResources;
