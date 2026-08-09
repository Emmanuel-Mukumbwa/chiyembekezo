import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Row, Col, Pagination } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { Button, Input, Select, ErrorState, LoadingSkeleton } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminLogs = () => {
  const { showModal } = useModal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    actor: '',
    action: '',
    target_type: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      const res = await api.get(`/admin/logs?${params}`);
      setLogs(res.data.logs);
      setPagination({
        ...pagination,
        total: res.data.total,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      setError('Failed to load logs.');
      showModal('Error', 'Failed to load logs.');
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
    setFilters({ search: '', actor: '', action: '', target_type: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
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
            onChange={handleFilterChange}
            placeholder="Search actions or email..."
          />
        </Col>
        <Col md={2}>
          <Input
            label="Actor"
            name="actor"
            value={filters.actor}
            onChange={handleFilterChange}
            placeholder="Admin email..."
          />
        </Col>
        <Col md={2}>
          <Input
            label="Action"
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            placeholder="e.g., Delete user"
          />
        </Col>
        <Col md={2}>
          <Select
            label="Target Type"
            name="target_type"
            value={filters.target_type}
            options={[
              { value: '', label: 'All Types' },
              { value: 'user', label: 'User' },
              { value: 'professional', label: 'Professional' },
              { value: 'article', label: 'Article' },
              { value: 'resource', label: 'Resource' },
              { value: 'appointment', label: 'Appointment' },
              { value: 'forum_post', label: 'Forum Post' },
              { value: 'emergency', label: 'Emergency Contact' },
            ]}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3} className="d-flex gap-2">
          <Button variant="primary" onClick={fetchLogs}>Apply</Button>
          <Button variant="outline-secondary" onClick={clearFilters}>Clear</Button>
        </Col>
      </Row>

      {/* Logs Table */}
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Time</th>
            <th>Admin</th>
            <th>Action</th>
            <th>Target Type</th>
            <th>Target ID</th>
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
                <td>{log.actor_email || 'System'}</td>
                <td>{log.action}</td>
                <td><Badge bg="secondary">{log.target_type || '-'}</Badge></td>
                <td>{log.target_id || '-'}</td>
                <td>
                  {log.details ? (
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => showModal('Log Details', <pre>{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>)}
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
    </Container>
  );
};

export default AdminLogs;
