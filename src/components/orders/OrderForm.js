import React, { useEffect, useState, useCallback } from 'react';
import { Form, Button, Alert, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { orderAPI, customerAPI, productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import useForm from '../../hooks/useForm';

const OrderForm = () => {
  const navigate = useNavigate();
  const { setLoading, setError } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  const initialState = {
    customerId: '',
    orderDate: new Date().toISOString().split('T')[0]
  };

  const fetchCustomersAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [customersResponse, productsResponse] = await Promise.all([
        customerAPI.getAll(),
        productAPI.getAll()
      ]);
      setCustomers(customersResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      setError('Failed to fetch customers and products');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setCustomers, setProducts]);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, [fetchCustomersAndProducts]);

  const handleAddProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]);
    }
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, quantity) => {
    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: parseInt(quantity) || 0 };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const onSubmit = async (formData) => {
    if (selectedProducts.length === 0) {
      setShowAlert({
        show: true,
        message: 'Please add at least one product to the order',
        variant: 'danger'
      });
      return;
    }

    const orderData = {
      ...formData,
      products: selectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      totalPrice: calculateTotal()
    };

    try {
      setLoading(true);
      await orderAPI.create(orderData);
      navigate('/orders/history');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const {
    formData,
    errors,
    handleChange,
    handleSubmit
  } = useForm(initialState, onSubmit);

  return (
    <div>
      <h2>Create New Order</h2>

      {showAlert.show && (
        <Alert 
          variant={showAlert.variant}
          onClose={() => setShowAlert({ show: false, message: '', variant: 'success' })}
          dismissible
        >
          {showAlert.message}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Customer</Form.Label>
          <Form.Select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            isInvalid={!!errors.customerId}
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.customerId}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Order Date</Form.Label>
          <Form.Control
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            isInvalid={!!errors.orderDate}
          />
          <Form.Control.Feedback type="invalid">
            {errors.orderDate}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Add Products</Form.Label>
          <Form.Select
            onChange={(e) => handleAddProduct(e.target.value)}
            value=""
          >
            <option value="">Select a product to add</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price.toFixed(2)}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {selectedProducts.length > 0 && (
          <Table striped bordered hover className="mb-3">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td colSpan="2"><strong>${calculateTotal().toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </Table>
        )}

        {errors.submit && (
          <Alert variant="danger" className="mb-3">
            {errors.submit}
          </Alert>
        )}

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            Create Order
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/orders/history')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default OrderForm;
