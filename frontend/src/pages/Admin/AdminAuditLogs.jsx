import React, { useState, useEffect } from 'react';
import { Container, Spinner, Button } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, SearchBar } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';

const AdminAuditLogs = () => {
  const { showModal } = useModal();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  useEffect(() => {
    fetchLogs();
  }, [search, pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/logs?search=${search}&page=${pagination.page}&limit=${pagination.limit}`);
      setLogs(res.data.logs);
      setPagination({ ...pagination, total: res.data.total });
    } catch (err) {
      setError('Failed to load audit logs.');
      showModal('Error', 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'created_at', label: 'Time', render: (val) => new Date(val).toLocaleString() },
    { field: 'actor_email', label: 'Actor', render: (val) => val || 'System' },
    { field: 'action', label: 'Action' },
    { field: 'target_type', label: 'Target Type' },
    { field: 'target_id', label: 'Target ID' },
    {
      field: 'details',
      label: 'Details',
      render: (val) => val ? <Button variant="link" size="sm" onClick={() => alert(JSON.stringify(val, null, 2))}>View</Button> : '-',
    },
  ];

  if (loading) return <Spinner animation="border" variant="primary" className="my-5 d-block mx-auto" />;
  if (error) return <ErrorState title="Error loading logs" description={error} onRetry={fetchLogs} />;

  return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Audit Logs</h4>
        <LogoutButton variant="outline-danger" size="sm" />
      </div>
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          onSearch={fetchLogs}
          placeholder="Search logs..."
        />
      </div>
      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        pagination
        pageSize={pagination.limit}
        totalItems={pagination.total}
        currentPage={pagination.page}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />
    </Container>
  );
};

export default AdminAuditLogs;
