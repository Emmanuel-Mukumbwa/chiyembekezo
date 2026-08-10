import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner, Modal, Table } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { ErrorState } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminAuditLogs = () => {
  const { showModal } = useModal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    actor_type: '',
    start_date: '',
    end_date: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [previewLog, setPreviewLog] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.actor_type) params.append('actor_type', filters.actor_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data.logs);
      setPagination(prev => ({ ...prev, page, total: res.data.total }));
    } catch (err) {
      setError('Failed to load audit logs.');
      showModal('Error', 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleApply = () => {
    fetchLogs(1);
  };

  const handleClear = () => {
    setFilters({ search: '', actor_type: '', start_date: '', end_date: '' });
    setTimeout(() => fetchLogs(1), 0);
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

    // If already an object, use directly
    if (typeof raw === 'object') {
      setPreviewLog(raw);
      return;
    }

    // If string, try to parse as JSON
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      try {
        setPreviewLog(JSON.parse(trimmed));
      } catch {
        // Not JSON – wrap safely
        setPreviewLog({ raw: trimmed });
      }
      return;
    }

    // For numbers, booleans, etc.
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
    if (previewLog.raw !== undefined) {
      return (
        <pre className="bg-light p-3" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '4px', fontSize: '0.9rem' }}>
          {previewLog.raw}
        </pre>
      );
    }
    if (previewLog.message) {
      return <p className="text-muted">{previewLog.message}</p>;
    }
    if (previewLog.value !== undefined) {
      return <p>{previewLog.value}</p>;
    }

    // Object/array – show as key-value table
    const entries = Object.entries(previewLog);
    if (entries.length === 0) return <p className="text-muted">Empty object</p>;

    return (
      <Table striped bordered size="sm" className="mb-0">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="fw-bold">{key}</td>
              <td>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

      <Row className="mb-3 g-2 align-items-end">
        <Col md={3}>
          <Form.Label className="small">Search</Form.Label>
          <Form.Control
            type="text"
            name="search"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Action, target, email..."
          />
        </Col>
        <Col md={2}>
          <Form.Label className="small">Actor Type</Form.Label>
          <Form.Select
            name="actor_type"
            value={filters.actor_type}
            onChange={(e) => setFilters(prev => ({ ...prev, actor_type: e.target.value }))}
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="professional">Professional</option>
            <option value="org_admin">Org Admin</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Label className="small">Start Date</Form.Label>
          <Form.Control
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </Col>
        <Col md={2}>
          <Form.Label className="small">End Date</Form.Label>
          <Form.Control
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </Col>
        <Col md={2} className="d-flex gap-2">
          <Button variant="primary" onClick={handleApply}>Apply</Button>
          <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <ErrorState title="Error" description={error} onRetry={() => fetchLogs(pagination.page)} />
      ) : (
        <>
          <Table striped bordered hover responsive size="sm">
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
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">No logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${getActorTypeBadge(log.actor_type)}`}>
                        {log.actor_type || 'user'}
                      </span>
                    </td>
                    <td>{log.actor_email || 'System'}</td>
                    <td>{log.action}</td>
                    <td>{log.target_type} {log.target_id ? `#${log.target_id}` : ''}</td>
                    <td>
                      {log.details ? (
                        <Button variant="link" size="sm" onClick={() => openDetails(log.details)}>
                          View
                        </Button>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="mx-3 align-self-center">
                Page {pagination.page} of {totalPages}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={pagination.page >= totalPages}
                onClick={() => fetchLogs(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      <Modal show={!!previewLog} onHide={() => setPreviewLog(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderDetailsContent()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewLog(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAuditLogs;
