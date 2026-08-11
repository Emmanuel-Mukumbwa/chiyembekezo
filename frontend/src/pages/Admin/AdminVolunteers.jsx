import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button, Modal, Card, Row, Col, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, LoadingSkeleton, Input } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const VolunteerCard = ({ vol, onVerify, onDelete, onPreview }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{vol.first_name} {vol.last_name}</h6>
          <small className="text-muted">{vol.email}</small>
        </div>
        <Badge bg={vol.is_verified ? 'success' : 'warning'}>{vol.is_verified ? 'Verified' : 'Pending'}</Badge>
      </div>
      <p className="mt-2 small text-muted">{vol.bio || 'No bio'}</p>
      <div className="d-flex gap-1 flex-wrap">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(vol)}>Preview</Button>
        <Button variant={vol.is_verified ? 'outline-secondary' : 'outline-primary'} size="sm" onClick={() => onVerify(vol.id, vol.is_verified)}>
          {vol.is_verified ? 'Unverify' : 'Verify'}
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(vol.id)}>Delete</Button>
      </div>
    </Card.Body>
  </Card>
);

const AdminVolunteers = () => {
  const { showModal } = useModal();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/volunteers?search=${appliedSearch}`);
      setVolunteers(res.data);
    } catch { setError('Failed to load volunteers.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVolunteers(); }, [appliedSearch]);

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const toggleVerify = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { is_verified: !current });
      fetchVolunteers();
    } catch { showModal('Error', 'Failed to update.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    showModal('Confirm Delete', 'Are you sure?', async () => {
      setActionLoading(id);
      try {
        await api.delete(`/admin/volunteers/${id}`);
        fetchVolunteers();
      } catch { showModal('Error', 'Failed to delete.'); }
      finally { setActionLoading(null); }
    });
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'first_name', label: 'Name', render: (_, row) => `${row.first_name} ${row.last_name}` },
    { field: 'email', label: 'Email' },
    { field: 'bio', label: 'Bio', render: (val) => val || '-' },
    { field: 'is_verified', label: 'Status', render: (val) => <Badge bg={val ? 'success' : 'warning'}>{val ? 'Verified' : 'Pending'}</Badge> },
    { field: 'actions', label: 'Actions', render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
          <Button variant={row.is_verified ? 'outline-secondary' : 'outline-primary'} size="sm" onClick={() => toggleVerify(row.id, row.is_verified)} disabled={actionLoading === row.id}>
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : row.is_verified ? 'Unverify' : 'Verify'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)} disabled={actionLoading === row.id}>
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : 'Delete'}
          </Button>
        </div>
      ) },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4"><h4>Volunteers</h4><LogoutButton variant="outline-danger" size="sm" /></div>
      <LoadingSkeleton type="list" />
    </Container>
  );

  if (error) return <ErrorState title="Error" description={error} onRetry={fetchVolunteers} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Volunteers</h4>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
              {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
            </Button>
            <LogoutButton variant="outline-danger" size="sm" />
          </div>
        </div>

        <Collapse in={filtersOpen}>
          <div>
            <Row className="mb-3 g-2 align-items-end">
              <Col md={4}>
                <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }} />
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button variant="primary" onClick={handleApply}>Apply</Button>
                <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </div>
        </Collapse>

        <div className="d-none d-md-block"><DataTable columns={columns} data={volunteers} keyField="id" /></div>
        <div className="d-md-none">
          {volunteers.length === 0 ? <p className="text-center text-muted">No volunteers found.</p> : volunteers.map(v => <VolunteerCard key={v.id} vol={v} onVerify={toggleVerify} onDelete={handleDelete} onPreview={setPreviewItem} />)}
        </div>
      </Container>

      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Volunteer Details</Modal.Title></Modal.Header>
        <Modal.Body>{previewItem && <div><h5>{previewItem.first_name} {previewItem.last_name}</h5><p><strong>Email:</strong> {previewItem.email}</p><p><strong>Bio:</strong> {previewItem.bio || 'N/A'}</p><p><strong>Status:</strong> <Badge bg={previewItem.is_verified ? 'success' : 'warning'}>{previewItem.is_verified ? 'Verified' : 'Pending'}</Badge></p></div>}</Modal.Body>
      </Modal>
    </>
  );
};

export default AdminVolunteers;
