import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Alert, Container, Card, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaUserPlus, FaDownload } from 'react-icons/fa';
import { customerAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CustomerList = () => {
  const { customers, setCustomers, setLoading, setError } = useAppContext();
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setCustomers]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        setCustomers(prev => prev.filter(customer => customer.id !== id));
        setShowAlert({
          show: true,
          message: 'Customer deleted successfully',
          variant: 'success'
        });
      } catch (error) {
        setShowAlert({
          show: true,
          message: 'Failed to delete customer',
          variant: 'danger'
        });
        console.error('Error deleting customer:', error);
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Total Orders', 'Last Order Date'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone,
        customer.totalOrders || 0,
        customer.lastOrderDate || 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Customer Management</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleExport}
                title="Export to CSV"
              >
                <FaDownload /> Export
              </Button>
              <Button
                as={Link}
                to="/customers/new"
                variant="primary"
              >
                <FaUserPlus className="me-1" /> Add Customer
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          {showAlert.show && (
            <Alert 
              variant={showAlert.variant}
              onClose={() => setShowAlert({ show: false, message: '', variant: 'success' })}
              dismissible
            >
              {showAlert.message}
            </Alert>
          )}

          <Table striped hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Contact Information</th>
                <th>Order History</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle p-2 me-3">
                        <FaUserPlus className="text-primary" />
                      </div>
                      <div>
                        <div className="fw-bold">{customer.name}</div>
                        <small className="text-muted">ID: {customer.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div><small className="text-muted">Email:</small> {customer.email}</div>
                      <div><small className="text-muted">Phone:</small> {customer.phone}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div><small className="text-muted">Total Orders:</small> {customer.totalOrders || 0}</div>
                      <div><small className="text-muted">Last Order:</small> {customer.lastOrderDate || 'Never'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        as={Link}
                        to={`/customers/${customer.id}`}
                        variant="outline-info"
                        size="sm"
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        as={Link}
                        to={`/customers/${customer.id}/edit`}
                        variant="outline-primary"
                        size="sm"
                        title="Edit Customer"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        title="Delete Customer"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <div className="text-muted">
                      No customers found{searchTerm ? ' matching your search' : ''}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerList;
