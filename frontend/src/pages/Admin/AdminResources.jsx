import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, SearchBar } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminResources = () => {
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, [search]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/resources?search=${search}`);
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
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/admin/resources/edit/${row.id}`)}
          >
            Edit
          </Button>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Resources</h4>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate('/admin/resources/create')}>+ New Resource</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          onSearch={fetchResources}
          placeholder="Search resources..."
        />
      </div>
      <DataTable columns={columns} data={resources} keyField="id" />
    </Container>
  );
};

export default AdminResources;
