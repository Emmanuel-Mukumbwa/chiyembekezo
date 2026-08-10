import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button, Modal, Row, Col } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, SearchBar, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminProfessionals = () => {
  const { showModal } = useModal();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => { fetchProfessionals(); }, [search]);

  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/professionals?search=${search}`);
      setProfessionals(res.data);
    } catch {
      setError('Failed to load professionals.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/professionals/${id}/verify`, { is_verified: !current });
      fetchProfessionals();
    } catch {
      showModal('Error', 'Failed to update.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure?', async () => {
      setActionLoading(id);
      try {
        await api.delete(`/admin/professionals/${id}`);
        fetchProfessionals();
      } catch {
        showModal('Error', 'Failed to delete.');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'first_name', label: 'Name', render: (_, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'specialization', label: 'Specialization' },
    { field: 'district', label: 'District' },
    {
      field: 'is_verified',
      label: 'Status',
      render: (val) => <Badge bg={val ? 'success' : 'warning'}>{val ? 'Verified' : 'Pending'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
          <Button
            variant={row.is_verified ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            onClick={() => toggleVerify(row.id, row.is_verified)}
            disabled={actionLoading === row.id}
          >
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : row.is_verified ? 'Unverify' : 'Verify'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)} disabled={actionLoading === row.id}>
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Professionals</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );

  if (error) return <ErrorState title="Error" description={error} onRetry={fetchProfessionals} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Professionals</h4>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
        <div className="mb-3" style={{ maxWidth: '300px' }}>
          <SearchBar value={search} onChange={setSearch} onSearch={fetchProfessionals} placeholder="Search..." />
        </div>
        <DataTable columns={columns} data={professionals} keyField="id" />
      </Container>

      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Professional Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              <h5>{previewItem.first_name} {previewItem.last_name}</h5>
              <p><strong>Email:</strong> {previewItem.email}</p>
              <p><strong>Specialization:</strong> {previewItem.specialization}</p>
              <p><strong>District:</strong> {previewItem.district}</p>
              <p><strong>Verified:</strong> {previewItem.is_verified ? 'Yes' : 'No'}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminProfessionals;
