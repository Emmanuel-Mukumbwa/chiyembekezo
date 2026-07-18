import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Form } from 'react-bootstrap';
import { useModal } from '../../context/ModalContext';
import api from '../../services/api';

const AdminProfessionals = () => {
  const { showModal } = useModal();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/professionals');
      setProfessionals(res.data);
    } catch (err) {
      showModal('Error', 'Failed to load professionals.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, current) => {
    try {
      await api.put(`/admin/professionals/${id}/verify`, { is_verified: !current });
      fetchProfessionals();
    } catch (err) {
      showModal('Error', 'Failed to update professional.');
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h4>Professionals</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>District</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {professionals.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.first_name} {p.last_name}</td>
              <td>{p.email}</td>
              <td>{p.specialization}</td>
              <td>{p.district}</td>
              <td>
                {p.is_verified ? (
                  <Badge bg="success">Verified</Badge>
                ) : (
                  <Badge bg="warning">Pending</Badge>
                )}
              </td>
              <td>
                <Button
                  variant={p.is_verified ? 'outline-secondary' : 'outline-primary'}
                  size="sm"
                  onClick={() => toggleVerify(p.id, p.is_verified)}
                >
                  {p.is_verified ? 'Unverify' : 'Verify'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminProfessionals;