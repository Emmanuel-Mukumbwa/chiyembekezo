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

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.actor_type) params.append('actor_type', filters.actor_type);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const res = await api.get(`/admin/logs?${params.toString()}`);
      setLogs(res.data.logs);
      setPagination(prev => ({ ...prev, total: res.data.total }));
    } catch (err) {
      setError('Failed to load audit logs.');
      showModal('Error', 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', actor_type: '', start_date: '', end_date: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActorTypeBadge = (type) => {
    if (type === 'admin') return 'primary';
    if (type === 'professional') return 'info';
    if (type === 'org_admin') return 'dark';
    return 'secondary'; // user or system
  };

  const formatJSON = (obj) => {
    if (!obj) return 'N/A';
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading logs" description={error} onRetry={fetchLogs} />;

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>

      {/* Filters */}
      <Row className="mb-3 g-2 align-items-end">
        <Col md={3}>
          <Form.Label className="small">Search</Form.Label>
          <Form.Control
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Action, target, email..."
          />
        </Col>
        <Col md={2}>
          <Form.Label className="small">Actor Type</Form.Label>
          <Form.Select name="actor_type" value={filters.actor_type} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="professional">Professional</option>
            <option value="org_admin">Org Admin</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Label className="small">Start Date</Form.Label>
          <Form.Control type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
        </Col>
        <Col md={2}>
          <Form.Label className="small">End Date</Form.Label>
          <Form.Control type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
        </Col>
        <Col md={2} className="d-flex gap-2">
          <Button variant="primary" onClick={fetchLogs}>Apply</Button>
          <Button variant="outline-secondary" onClick={clearFilters}>Clear</Button>
        </Col>
      </Row>

      {/* Table */}
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
                    <Button variant="link" size="sm" onClick={() => setPreviewLog(log.details)}>
                      View
                    </Button>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="mx-3 align-self-center">Page {pagination.page} of {totalPages}</span>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Modal show={!!previewLog} onHide={() => setPreviewLog(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Log Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="bg-light p-3" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '4px', fontSize: '0.9rem' }}>
            {formatJSON(previewLog)}
          </pre>
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
