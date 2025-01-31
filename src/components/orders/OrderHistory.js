import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { orderAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const OrderHistory = () => {
  const { setLoading, setError } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderAPI.update(id, { status: 'cancelled' });
        setOrders(prev => prev.map(order => 
          order.id === id ? { ...order, status: 'cancelled' } : order
        ));
        setShowAlert({
          show: true,
          message: 'Order cancelled successfully',
          variant: 'success'
        });
      } catch (error) {
        setShowAlert({
          show: true,
          message: 'Failed to cancel order',
          variant: 'danger'
        });
        console.error('Error cancelling order:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order History</h2>
        <Button
          as={Link}
          to="/orders/new"
          variant="primary"
        >
          Create New Order
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
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer?.name}</td>
              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    as={Link}
                    to={`/orders/${order.id}`}
                    variant="info"
                    size="sm"
                  >
                    <FaEye />
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderHistory;
