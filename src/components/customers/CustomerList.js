import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <Button
          as={Link}
          to="/customers/new"
          variant="primary"
        >
          Add New Customer
        </Button>
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

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    as={Link}
                    to={`/customers/${customer.id}`}
                    variant="info"
                    size="sm"
                  >
                    <FaEye />
                  </Button>
                  <Button
                    as={Link}
                    to={`/customers/${customer.id}/edit`}
                    variant="warning"
                    size="sm"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomerList;
