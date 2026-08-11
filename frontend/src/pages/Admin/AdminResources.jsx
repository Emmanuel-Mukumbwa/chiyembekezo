import React, { useEffect, useState } from 'react';
import { Container, Spinner, Badge, Button, Modal, Card, Row, Col, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';
import { DataTable, ErrorState, LoadingSkeleton, Input } from '../../components/ui';
import LogoutButton from '../../components/LogoutButton';
import { FiFilter, FiX } from 'react-icons/fi';

const ResourceCard = ({ res, onTogglePublish, onDelete, onPreview }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h6 className="mb-1">{res.title}</h6>
          <small className="text-muted">{res.type} · {res.category || 'Uncategorized'}</small>
        </div>
        <Badge bg={res.is_published ? 'success' : 'secondary'}>
          {res.is_published ? 'Published' : 'Draft'}
        </Badge>
      </div>
      <div className="d-flex gap-1 mt-3 flex-wrap">
        <Button variant="outline-info" size="sm" onClick={() => onPreview(res)}>Preview</Button>
        <Button variant="outline-primary" size="sm" onClick={() => onTogglePublish(res.id, res.is_published)}>
          {res.is_published ? 'Unpublish' : 'Publish'}
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(res.id)}>Delete</Button>
      </div>
    </Card.Body>
  </Card>
);

const AdminResources = () => {
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/resources?search=${appliedSearch}`);
      setResources(res.data);
    } catch {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [appliedSearch]);

  const handleApply = () => setAppliedSearch(search);
  const handleClear = () => { setSearch(''); setAppliedSearch(''); };

  const togglePublish = async (id, current) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/resources/${id}/publish`, { is_published: !current });
      fetchResources();
    } catch {
      showModal('Error', 'Failed to update.');
    } finally { setActionLoading(null); }
  };

  const deleteResource = async (id) => {
    showModal('Confirm Delete', 'Are you sure?', async () => {
      setActionLoading(id);
      try {
        await api.delete(`/admin/resources/${id}`);
        fetchResources();
      } catch {
        showModal('Error', 'Failed to delete.');
      } finally { setActionLoading(null); }
    });
  };

  const openPreview = async (row) => {
    setPreviewLoading(true);
    try {
      const res = await api.get(`/admin/resources/${row.id}`);
      setPreviewResource(res.data);
    } catch {
      showModal('Error', 'Could not load preview.');
    } finally { setPreviewLoading(false); }
  };

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'title', label: 'Title' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category', render: (val) => val || 'Uncategorized' },
    { field: 'view_count', label: 'Views' },
    {
      field: 'org_name',
      label: 'Source',
      render: (val) => val ? <Badge bg="info">{val}</Badge> : <Badge bg="secondary">Admin</Badge>,
    },
    {
      field: 'is_published',
      label: 'Status',
      render: (val) => <Badge bg={val ? 'success' : 'secondary'}>{val ? 'Published' : 'Draft'}</Badge>,
    },
    {
      field: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-1">
          <Button variant="outline-info" size="sm" onClick={() => openPreview(row)}>Preview</Button>
          <Button variant="outline-primary" size="sm" onClick={() => navigate(`/admin/resources/edit/${row.id}`)}>Edit</Button>
          <Button
            variant={row.is_published ? 'outline-secondary' : 'outline-primary'}
            size="sm"
            onClick={() => togglePublish(row.id, row.is_published)}
            disabled={actionLoading === row.id}
          >
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : row.is_published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteResource(row.id)} disabled={actionLoading === row.id}>
            {actionLoading === row.id ? <Spinner size="sm" animation="border" /> : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  const renderPreviewContent = () => {
    if (!previewResource) return null;
    const { title, type, description, content, author, url, tags, duration_minutes, view_count, org_name } = previewResource;
    return (
      <div>
        <h5>{title}</h5>
        <p className="text-muted">
          {type} | {author ? `by ${author}` : 'Unknown author'} | {duration_minutes ? `${duration_minutes} min` : ''}
          {org_name && <Badge bg="info" className="ms-2">{org_name}</Badge>}
        </p>
        <p>{description}</p>
        {type === 'article' || type === 'course' ? (
          <div className="border p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>{content}</div>
        ) : url && (
          <div className="mt-3">
            {type === 'video' ? <video controls style={{ maxWidth: '100%', maxHeight: '400px' }}><source src={url} type="video/mp4" /></video> :
             type === 'podcast' ? <audio controls style={{ width: '100%' }}><source src={url} type="audio/mpeg" /></audio> :
             type === 'pdf' ? <iframe src={url} style={{ width: '100%', height: '500px' }} title="PDF preview" /> :
             <a href={url} target="_blank" rel="noopener noreferrer">Open file</a>}
          </div>
        )}
        {tags && <div className="mt-2">{Array.isArray(tags) ? tags.map(tag => <Badge bg="info" className="me-1" key={tag}>{tag}</Badge>) : <Badge bg="info">{tags}</Badge>}</div>}
        <small className="text-muted">Views: {view_count}</small>
      </div>
    );
  };

  if (loading) return (
    <Container fluid className="px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Resources</h4>
        <div className="d-flex gap-2">
          <Button variant="primary">+ New Resource</Button>
          <LogoutButton variant="outline-danger" size="sm" />
        </div>
      </div>
      <LoadingSkeleton type="list" />
    </Container>
  );

  if (error) return <ErrorState title="Error" description={error} onRetry={fetchResources} />;

  return (
    <>
      <Container fluid className="px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Resources</h4>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => navigate('/admin/resources/create')}>+ New Resource</Button>
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
                <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }} />
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button variant="primary" onClick={handleApply}>Apply</Button>
                <Button variant="outline-secondary" onClick={handleClear}>Clear</Button>
              </Col>
            </Row>
          </div>
        </Collapse>

        <div className="d-none d-md-block"><DataTable columns={columns} data={resources} keyField="id" /></div>
        <div className="d-md-none">
          {resources.length === 0 ? (
            <p className="text-center text-muted">No resources found.</p>
          ) : (
            resources.map(r => <ResourceCard key={r.id} res={r} onTogglePublish={togglePublish} onDelete={deleteResource} onPreview={openPreview} />)
          )}
        </div>
      </Container>

      <Modal show={!!previewResource} onHide={() => setPreviewResource(null)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Resource Preview</Modal.Title></Modal.Header>
        <Modal.Body>
          {previewLoading ? <div className="text-center"><Spinner animation="border" /></div> : renderPreviewContent()}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setPreviewResource(null)}>Close</Button></Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminResources;
