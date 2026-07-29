import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState } from '../../components/ui';

const AdminProfessionals = () => {
  const { showModal } = useModal();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/professionals');
      setProfessionals(res.data);
    } catch (err) {
      setError('Failed to load professionals.');
      showModal('Error', 'Failed to load professionals.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, current) => {
    try {
      await api.put(`/admin/professionals/${id}/verify`, { is_verified: !current });
      showModal('Success', 'Professional updated.');
      fetchProfessionals();
    } catch (err) {
      showModal('Error', 'Failed to update professional.');
    }
  };

  const deleteProfessional = async (id) => {
    if (!window.confirm('Delete this professional?')) return;
    try {
      await api.delete(`/admin/professionals/${id}`);
      showModal('Success', 'Professional deleted.');
      fetchProfessionals();
    } catch (err) {
      showModal('Error', 'Failed to delete professional.');
    }
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'first_name', label: 'Name', render: (val, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'specialization', label: 'Specialization' },
    { field: 'district', label: 'District' },
    {
      field: 'is_verified',
      label: 'Verified',
      render: (val) => <Badge bg={val ? 'success' : 'warning'}>{val ? 'Verified' : 'Pending'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button
            variant={row.is_verified ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            onClick={() => toggleVerify(row.id, row.is_verified)}
          >
            {row.is_verified ? 'Unverify' : 'Verify'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteProfessional(row.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading professionals" description={error} onRetry={fetchProfessionals} />;

  return (
    <Container fluid className="px-4">
      <h4>Professionals</h4>
      <DataTable columns={columns} data={professionals} keyField="id" />
    </Container>
  );
};

export default AdminProfessionals;
