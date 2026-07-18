import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminResources = () => {
  const { showModal } = useModal();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources');
      setResources(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id, current) => {
    try {
      await api.put(`/admin/resources/${id}/publish`, { is_published: !current });
      fetchResources();
    } catch (err) {
      showModal('Error', 'Failed to update resource.');
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      fetchResources();
    } catch (err) {
      showModal('Error', 'Failed to delete resource.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Resources</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Views</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.title}</td>
              <td>{r.type}</td>
              <td>{r.category || 'Uncategorized'}</td>
              <td>{r.view_count || 0}</td>
              <td>
                {r.is_published ? (
                  <Badge bg="success">Published</Badge>
                ) : (
                  <Badge bg="secondary">Draft</Badge>
                )}
              </td>
              <td>
                <Button
                  variant={r.is_published ? 'outline-secondary' : 'outline-primary'}
                  size="sm"
                  onClick={() => togglePublish(r.id, r.is_published)}
                >
                  {r.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="danger" size="sm" className="ms-1" onClick={() => deleteResource(r.id)}>
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

export default AdminResources;