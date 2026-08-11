import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Modal, Table, Card, Collapse } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { ErrorState } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const LogCard = ({ log, onView }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <small className="text-muted">{new Date(log.created_at).toLocaleString()}</small>
          <br />
          <span className={`badge bg-${log.actor_type === 'admin' ? 'primary' : log.actor_type === 'professional' ? 'info' : 'secondary'}`}>
            {log.actor_type || 'user'}
          </span>
          <span className="ms-2">{log.actor_email || 'System'}</span>
        </div>
      </div>
      <p className="mt-2 mb-1">{log.action}</p>
      <small className="text-muted">{log.target_type} {log.target_id ? `#${log.target_id}` : ''}</small>
      <div className="mt-2">
        {log.details ? (
          <Button variant="link" size="sm" onClick={() => onView(log.details)}>
            View Details
          </Button>
        ) : '-'}
      </div>
    </Card.Body>
  </Card>
);

const AdminAuditLogs = () => {
  const { showModal } = useModal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    actor_type: '',
    start_date: '',
    end_date: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [previewLog, setPreviewLog] = useState(null);

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
      setError('Failed to load audit logs.');
      showModal('Error', 'Failed to load audit logs.');
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
    if (raw == null || raw === '') {
      setPreviewLog({ message: 'No additional details available.' });
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

  const getActorTypeBadge = (type) => {
    if (type === 'admin') return 'primary';
    if (type === 'professional') return 'info';
    if (type === 'org_admin') return 'dark';
    return 'secondary';
  };

  const renderDetailsContent = () => {
    if (!previewLog) return null;
    if (previewLog.raw) {
      return <pre className="bg-light p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>{previewLog.raw}</pre>;
    }
    if (previewLog.message) return <p className="text-muted">{previewLog.message}</p>;
    if (previewLog.value) return <p>{previewLog.value}</p>;
    const entries = Object.entries(previewLog);
    if (entries.length === 0) return <p className="text-muted">Empty object</p>;
    return (
      <Table striped bordered size="sm" className="mb-0">
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>{entries.map(([k, v]) => <tr key={k}><td className="fw-bold">{k}</td><td>{typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}</td></tr>)}</tbody>
      </Table>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <Spinner animation="border" className="d-block mx-auto" />
    </Container>
  );
  if (error) return <ErrorState title="Error" description={error} onRetry={() => fetchLogs()} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="d-flex align-items-center gap-1">
            {filtersOpen ? <FiX size={14} /> : <FiFilter size={14} />}
            {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>

      <Collapse in={filtersOpen}>
        <div>
          <Row className="g-2 mb-3 align-items-end">
            <Col md={4} lg={3}>
              <Form.Label className="small">Search</Form.Label>
              <Form.Control type="text" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} onKeyDown={handleKeyDown} placeholder="Action, target, email..." />
            </Col>
            <Col md={3} lg={2}>
              <Form.Label className="small">Actor Type</Form.Label>
              <Form.Select value={filters.actor_type} onChange={(e) => setFilters(prev => ({ ...prev, actor_type: e.target.value }))}>
                <option value="">All</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="professional">Professional</option>
                <option value="org_admin">Org Admin</option>
              </Form.Select>
            </Col>
            <Col md={3} lg={2}>
              <Form.Label className="small">Start Date</Form.Label>
              <Form.Control type="date" value={filters.start_date} onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))} />
            </Col>
            <Col md={3} lg={2}>
              <Form.Label className="small">End Date</Form.Label>
              <Form.Control type="date" value={filters.end_date} onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))} />
            </Col>
            <Col md={4} lg={3} className="d-flex gap-2">
              <Button variant="primary" onClick={handleApply}>Apply</Button>
              <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
            </Col>
          </Row>
        </div>
      </Collapse>

      {/* Desktop Table */}
      <div className="d-none d-md-block">
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr><th>Time</th><th>Type</th><th>Actor</th><th>Action</th><th>Target</th><th>Details</th></tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td className="text-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td><span className={`badge bg-${getActorTypeBadge(log.actor_type)}`}>{log.actor_type || 'user'}</span></td>
                  <td>{log.actor_email || 'System'}</td>
                  <td>{log.action}</td>
                  <td>{log.target_type} {log.target_id ? `#${log.target_id}` : ''}</td>
                  <td>{log.details ? <Button variant="link" size="sm" onClick={() => openDetails(log.details)}>View</Button> : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="d-md-none">
        {logs.length === 0 ? (
          <p className="text-center text-muted">No logs found.</p>
        ) : (
          logs.map(log => <LogCard key={log.id} log={log} onView={openDetails} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Button variant="outline-secondary" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}>Previous</Button>
          <span className="mx-3 align-self-center">Page {pagination.page} of {totalPages}</span>
          <Button variant="outline-secondary" size="sm" disabled={pagination.page >= totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}>Next</Button>
        </div>
      )}

      <Modal show={!!previewLog} onHide={() => setPreviewLog(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Log Details</Modal.Title></Modal.Header>
        <Modal.Body>{renderDetailsContent()}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setPreviewLog(null)}>Close</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAuditLogs;
