import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Row, Col, Pagination, Modal, Button as BsButton } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, Select, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminLogs = () => {
  const { showModal } = useModal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI filter fields (not yet applied)
  const [filters, setFilters] = useState({
    search: '',
    actor_type: '',
    start_date: '',
    end_date: '',
  });

  // These are the filters actually used for API calls (applied on click)
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [previewLog, setPreviewLog] = useState(null);

  // Fetch logs whenever appliedFilters or page changes
  useEffect(() => {
    fetchLogs();
  }, [appliedFilters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (appliedFilters.search) params.append('search', appliedFilters.search);
      if (appliedFilters.actor_type) params.append('actor_type', appliedFilters.actor_type);
      if (appliedFilters.start_date) params.append('start_date', appliedFilters.start_date);
      if (appliedFilters.end_date) params.append('end_date', appliedFilters.end_date);

      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data.logs);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
        totalPages: Math.ceil(res.data.total / prev.limit),
      }));
    } catch (err) {
      setError('Failed to load logs.');
      showModal('Error', 'Failed to load logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setAppliedFilters({ ...filters });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    const reset = { search: '', actor_type: '', start_date: '', end_date: '' };
    setFilters(reset);
    setAppliedFilters(reset);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const openDetails = (raw) => {
    if (!raw) {
      setPreviewLog(null);
      return;
    }
    if (typeof raw === 'object') {
      setPreviewLog(raw);
      return;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      try {
        setPreviewLog(JSON.parse(trimmed));
      } catch {
        setPreviewLog({ raw: trimmed });
      }
      return;
    }
    setPreviewLog({ value: String(raw) });
  };

  const renderDetails = () => {
    if (!previewLog) return null;
    if (previewLog.raw) {
      return <pre className="bg-light p-3" style={{ whiteSpace: 'pre-wrap' }}>{previewLog.raw}</pre>;
    }
    return <pre className="bg-light p-3" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(previewLog, null, 2)}</pre>;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <LoadingSkeleton type="list" />
      <LoadingSkeleton type="list" className="mt-3" />
    </Container>
  );
  if (error) return <ErrorState title="Error loading logs" description={error} onRetry={fetchLogs} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

      {/* Filters */}
      <Row className="g-2 mb-3 align-items-end">
        <Col md={3}>
          <Input
            label="Search"
            name="search"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Search actions or email..."
          />
        </Col>
        <Col md={2}>
          <Select
            label="Actor Type"
            name="actor_type"
            value={filters.actor_type}
            options={[
              { value: '', label: 'All' },
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
              { value: 'professional', label: 'Professional' },
              { value: 'org_admin', label: 'Org Admin' },
            ]}
            onChange={(e) => setFilters(prev => ({ ...prev, actor_type: e.target.value }))}
          />
        </Col>
        <Col md={2}>
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </Col>
        <Col md={2}>
          <Input
            label="End Date"
            name="end_date"
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </Col>
        <Col md={3} className="d-flex gap-2">
          <Button variant="primary" onClick={handleApply}>Apply</Button>
          <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
        </Col>
      </Row>

      {/* Logs Table */}
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="6" className="text-center text-muted">No logs found.</td></tr>
          ) : (
            logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.created_at).toLocaleString()}</td>
                <td>
                  <Badge bg={
                    log.actor_type === 'admin' ? 'primary' :
                    log.actor_type === 'professional' ? 'info' :
                    log.actor_type === 'org_admin' ? 'dark' : 'secondary'
                  }>
                    {log.actor_type || 'user'}
                  </Badge>
                </td>
                <td>{log.actor_email || 'System'}</td>
                <td>{log.action}</td>
                <td>
                  {log.target_type ? (
                    <Badge bg="secondary">{log.target_type} {log.target_id ? `#${log.target_id}` : ''}</Badge>
                  ) : '-'}
                </td>
                <td>
                  {log.details ? (
                    <span
                      style={{ cursor: 'pointer', color: '#0d6efd' }}
                      onClick={() => openDetails(log.details)}
                    >
                      View
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-end">
          <Pagination>
            <Pagination.Prev
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            />
            {[...Array(pagination.totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === pagination.page}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* Details Modal */}
      <Modal show={!!previewLog} onHide={() => setPreviewLog(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderDetails()}
        </Modal.Body>
        <Modal.Footer>
          <BsButton variant="secondary" onClick={() => setPreviewLog(null)}>Close</BsButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminLogs;
