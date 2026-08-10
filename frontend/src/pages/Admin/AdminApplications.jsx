import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, EmptyState, ErrorState, LoadingSkeleton, SearchBar } from '../../components/ui';

const AdminApplications = () => {
  const { showModal } = useModal();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', type: '', search: '' });
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);
      const res = await api.get(`/admin/applications?${params}`);
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load applications.');
      showModal('Error', 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const review = async (id, status) => {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      showModal('Success', `Application ${status}.`);
      fetchData();
    } catch (err) {
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
      <Row className="mb-3 g-2">
        <Col md={3}><LoadingSkeleton type="card" lines={2} /></Col>
        <Col md={3}><LoadingSkeleton type="card" lines={2} /></Col>
        <Col md={3}><LoadingSkeleton type="card" lines={2} /></Col>
      </Row>
      <LoadingSkeleton type="list" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading applications" description={error} onRetry={fetchData} />;

  return (
    <>
      <Container fluid className="px-4">
        <h4 className="mb-4">Applications</h4>
        <Row className="mb-3 g-2 align-items-end">
          <Col md={3}>
            <Select
              label="Status"
              name="status"
              value={filter.status}
              options={[
                { value: '', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Select
              label="Type"
              name="type"
              value={filter.type}
              options={[
                { value: '', label: 'All Types' },
                { value: 'professional', label: 'Professional' },
                { value: 'volunteer', label: 'Volunteer' },
              ]}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <SearchBar
              value={filter.search}
              onChange={(val) => setFilter({ ...filter, search: val })}
              onSearch={fetchData}
              placeholder="Search by name or email..."
            />
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button variant="primary" onClick={fetchData}>Apply</Button>
            <Button variant="outline-secondary" onClick={() => setFilter({ status: '', type: '', search: '' })}>Clear</Button>
          </Col>
        </Row>

        {applications.length === 0 ? (
          <EmptyState icon="📋" title="No applications" description="No applications match your filters." />
        ) : (
          <DataTable columns={columns} data={applications} keyField="id" />
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
