import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Badge, Button, Modal, Card, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, EmptyState, ErrorState, LoadingSkeleton, Input } from '../../components/ui';
import { FiFilter, FiX } from 'react-icons/fi';

const AppCard = ({ app, onPreview, onApprove, onReject }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{app.first_name} {app.last_name}</h6>
          <small className="text-muted">{app.email}</small>
          <br />
          <small className="text-muted">{app.type} · {app.specialization || 'N/A'}</small>
        </div>
        <Badge bg={app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'success' : 'danger'}>
          {app.status}
        </Badge>
      </div>
      <div className="d-flex gap-1 mt-2 flex-wrap">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(app)}>Preview</Button>
        {app.status === 'pending' && (
          <>
            <Button variant="success" size="sm" onClick={() => onApprove(app.id)}>Approve</Button>
            <Button variant="danger" size="sm" onClick={() => onReject(app.id)}>Reject</Button>
          </>
        )}
      </div>
    </Card.Body>
  </Card>
);

const AdminApplications = () => {
  const { showModal } = useModal();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState({ status: '', type: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', type: '', search: '' });
  const [previewItem, setPreviewItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (appliedFilters.status) params.append('status', appliedFilters.status);
      if (appliedFilters.type) params.append('type', appliedFilters.type);
      if (appliedFilters.search) params.append('search', appliedFilters.search);
      const res = await api.get(`/admin/applications?${params}`);
      setApplications(res.data);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [appliedFilters]);

  const handleApply = () => {
    setAppliedFilters({ ...filter });
  };

  const handleClear = () => {
    setFilter({ status: '', type: '', search: '' });
    setAppliedFilters({ status: '', type: '', search: '' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      showModal('Success', `Application ${status}.`);
      fetchData();
    } catch {
      showModal('Error', 'Failed to review application.');
    }
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'first_name', label: 'User', render: (val, row) => `${row.first_name} ${row.last_name} (${row.email})` },
    { field: 'type', label: 'Type' },
    { field: 'specialization', label: 'Specialization', render: (val) => val || '-' },
    {
      field: 'status',
      label: 'Status',
      render: (val) => {
        const color = val === 'pending' ? 'warning' : val === 'approved' ? 'success' : 'danger';
        return <Badge bg={color}>{val}</Badge>;
      },
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
          {row.status === 'pending' && (
            <>
              <Button variant="success" size="sm" onClick={() => review(row.id, 'approved')}>Approve</Button>
              <Button variant="danger" size="sm" onClick={() => review(row.id, 'rejected')}>Reject</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Applications</h4>
      <LoadingSkeleton type="list" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading applications" description={error} onRetry={fetchData} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Applications</h4>
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />} {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
        </div>

        <Collapse in={filtersOpen}>
          <div>
            <Row className="mb-3 g-2 align-items-end">
              <Col md={3}>
                <Select label="Status" name="status" value={filter.status}
                  options={[{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })} />
              </Col>
              <Col md={3}>
                <Select label="Type" name="type" value={filter.type}
                  options={[{ value: '', label: 'All Types' }, { value: 'professional', label: 'Professional' }, { value: 'volunteer', label: 'Volunteer' }]}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })} />
              </Col>
              <Col md={3}>
                <Input label="Search" name="search" value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })} onKeyDown={handleKeyDown} placeholder="Name or email..." />
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button variant="primary" onClick={handleApply}>Apply</Button>
                <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </div>
        </Collapse>

        {applications.length === 0 ? (
          <EmptyState icon="📋" title="No applications" description="No applications match your filters." />
        ) : (
          <>
            <div className="d-none d-md-block"><DataTable columns={columns} data={applications} keyField="id" /></div>
            <div className="d-md-none">
              {applications.map(app => <AppCard key={app.id} app={app} onPreview={setPreviewItem} onApprove={review} onReject={review} />)}
            </div>
          </>
        )}
      </Container>

      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Application Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              <h5>{previewItem.first_name} {previewItem.last_name} ({previewItem.email})</h5>
              <p><strong>Type:</strong> {previewItem.type}</p>
              <p><strong>Specialization:</strong> {previewItem.specialization || '-'}</p>
              <p><strong>Qualifications:</strong> {previewItem.qualifications || '-'}</p>
              <p><strong>Experience:</strong> {previewItem.experience || '-'}</p>
              <p><strong>Message:</strong> {previewItem.message || '-'}</p>
              <p><strong>Status:</strong> <Badge bg={previewItem.status === 'pending' ? 'warning' : previewItem.status === 'approved' ? 'success' : 'danger'}>{previewItem.status}</Badge></p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminApplications;
