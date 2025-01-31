import React, { useEffect, useState } from 'react';
import { Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { customerAPI, orderAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading, setError } = useAppContext();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerResponse, ordersResponse] = await Promise.all([
        customerAPI.getById(id),
        orderAPI.getCustomerOrders(id)
      ]);
      setCustomer(customerResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      setError('Failed to fetch customer details');
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        setShowAlert({
          show: true,
          message: 'Customer deleted successfully',
          variant: 'success'
        });
        setTimeout(() => navigate('/customers'), 1500);
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

  if (!customer) {
    return null;
  }

  return (
    <div>
      {showAlert.show && (
        <Alert 
          variant={showAlert.variant}
          onClose={() => setShowAlert({ show: false, message: '', variant: 'success' })}
          dismissible
        >
          {showAlert.message}
        </Alert>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Customer Details</h3>
          <div className="d-flex gap-2">
            <Button
              as={Link}
              to={`/customers/${id}/edit`}
              variant="warning"
            >
              <FaEdit /> Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              <FaTrash /> Delete
            </Button>
          </div>
        </Card.Header>
        
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Name:</strong> {customer.name}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Email:</strong> {customer.email}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Phone:</strong> {customer.phone}
          </ListGroup.Item>
        </ListGroup>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h4 className="mb-0">Order History</h4>
        </Card.Header>
        <ListGroup variant="flush">
          {orders.length === 0 ? (
            <ListGroup.Item>No orders found for this customer</ListGroup.Item>
          ) : (
            orders.map((order) => (
              <ListGroup.Item key={order.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Order ID:</strong> {order.id}
                    <br />
                    <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                    <br />
                    <strong>Total:</strong> ${order.totalPrice}
                  </div>
                  <Button
                    as={Link}
                    to={`/orders/${order.id}`}
                    variant="info"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetails;
