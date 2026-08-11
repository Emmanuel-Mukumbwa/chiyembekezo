import React, { useState, useEffect, useRef } from 'react';
import { Container, Badge, Row, Col, Button, Modal, Spinner, Card, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Select, DataTable, ErrorState, LoadingSkeleton, Input } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const RequestCard = ({ req, onAssign, volunteers, onUnassign, onPreview }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{req.user_first} {req.user_last}</h6>
          <small className="text-muted">{req.message?.slice(0, 80)}{req.message?.length > 80 ? '...' : ''}</small>
        </div>
        <Badge bg={req.status === 'pending' ? 'warning' : req.status === 'accepted' ? 'info' : req.status === 'completed' ? 'success' : 'secondary'}>
          {req.status}
        </Badge>
      </div>
      <div className="mt-2">
        {req.volunteer_id ? (
          <small className="text-muted">Assigned: {req.vol_first} {req.vol_last}</small>
        ) : (
          <small className="text-warning">Unassigned</small>
        )}
      </div>
      <div className="d-flex gap-1 mt-2 flex-wrap">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(req)}>Preview</Button>
        {req.status === 'pending' && (
          <Select
            name="assign"
            value=""
            options={[
              { value: '', label: 'Assign...' },
              ...volunteers.filter(v => v.is_verified).map(v => ({ value: v.id, label: `${v.first_name} ${v.last_name}` })),
            ]}
            onChange={(e) => { if (e.target.value) onAssign(req.id, parseInt(e.target.value)); }}
            className="mb-0" style={{ width: '160px' }}
          />
        )}
        {req.volunteer_id && (
          <Button variant="outline-danger" size="sm" onClick={() => onUnassign(req.id)}>Unassign</Button>
        )}
      </div>
    </Card.Body>
  </Card>
);

const AdminPeerSupport = () => {
  const { showModal } = useModal();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', search: '' });
  const [previewItem, setPreviewItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, volRes] = await Promise.all([
        api.get(`/admin/peer-support/requests?status=${appliedFilters.status}&search=${appliedFilters.search}`),
        api.get('/admin/volunteers'),
      ]);
      setRequests(reqRes.data);
      setVolunteers(volRes.data);
    } catch {
      setError('Failed to load data.');
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
    setFilter({ status: '', search: '' });
    setAppliedFilters({ status: '', search: '' });
  };

  const assignVolunteer = async (requestId, volunteerId) => {
    try {
      await api.put(`/admin/peer-support/requests/${requestId}/assign`, { volunteerId });
      showModal('Success', 'Volunteer assigned.');
      fetchData();
    } catch {
      showModal('Error', 'Failed to assign.');
    }
  };

  const unassignVolunteer = async (requestId) => {
    showModal('Confirm Unassign', 'Are you sure?', async () => {
      try {
        await api.put(`/admin/peer-support/requests/${requestId}/unassign`);
        showModal('Success', 'Volunteer unassigned.');
        fetchData();
      } catch {
        showModal('Error', 'Failed to unassign.');
      }
    });
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'user_first', label: 'User', render: (val, row) => `${row.user_first} ${row.user_last}` },
    { field: 'message', label: 'Message' },
    { field: 'status', label: 'Status', render: (val) => <Badge bg={val === 'pending' ? 'warning' : val === 'accepted' ? 'info' : val === 'completed' ? 'success' : 'secondary'}>{val}</Badge> },
    { field: 'volunteer_id', label: 'Volunteer', render: (val, row) => val ? `${row.vol_first} ${row.vol_last}` : 'Not assigned' },
    {
      field: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1 align-items-center">
          <Button variant="outline-info" size="sm" onClick={() => setPreviewItem(row)}>Preview</Button>
          {row.status === 'pending' && (
            <Select
              name="assign"
              value=""
              options={[
                { value: '', label: 'Assign volunteer' },
                ...volunteers.filter(v => v.is_verified).map(v => ({ value: v.id, label: `${v.first_name} ${v.last_name}` })),
              ]}
              onChange={(e) => { if (e.target.value) assignVolunteer(row.id, parseInt(e.target.value)); }}
              className="mb-0" style={{ width: '180px' }}
            />
          )}
          {row.volunteer_id && (
            <Button variant="outline-danger" size="sm" onClick={() => unassignVolunteer(row.id)}>Unassign</Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Peer Support Requests</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading data" description={error} onRetry={fetchData} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Peer Support Requests</h4>
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
              <Col md={3}>
                <Select
                  label="Status"
                  value={filter.status}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'accepted', label: 'Accepted' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <Input
                  label="Search"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  placeholder="Search by user..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
                />
              </Col>
              <Col md={3} className="d-flex gap-2">
                <Button variant="primary" onClick={handleApply}>Apply</Button>
                <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </div>
        </Collapse>

        <div className="d-none d-md-block"><DataTable columns={columns} data={requests} keyField="id" /></div>
        <div className="d-md-none">
          {requests.length === 0 ? (
            <p className="text-center text-muted">No requests found.</p>
          ) : (
            requests.map(req => (
              <RequestCard key={req.id} req={req} volunteers={volunteers} onAssign={assignVolunteer} onUnassign={unassignVolunteer} onPreview={setPreviewItem} />
            ))
          )}
        </div>
      </Container>

      <Modal show={!!previewItem} onHide={() => setPreviewItem(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Request Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {previewItem && (
            <div>
              <h5>{previewItem.user_first} {previewItem.user_last}</h5>
              <p><strong>Message:</strong> {previewItem.message}</p>
              <p><strong>Status:</strong> {previewItem.status}</p>
              <p><strong>Volunteer:</strong> {previewItem.volunteer_id ? `${previewItem.vol_first} ${previewItem.vol_last}` : 'Unassigned'}</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminPeerSupport;
