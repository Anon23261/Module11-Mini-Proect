import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Modal,
  Alert,
  Badge
} from 'react-bootstrap';
import {
  FaShoppingCart,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUser,
  FaBox,
  FaDollarSign,
  FaCalendarAlt
} from 'react-icons/fa';
import { orderAPI, customerAPI, productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const OrderManagement = () => {
  const { setLoading, setError } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({
    customerId: '',
    products: [{ productId: '', quantity: 1 }],
    total: 0
  });
  const [validation, setValidation] = useState({});

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

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();
  }, []);

  const handleModalShow = (mode, order = null) => {
    setModalMode(mode);
    setSelectedOrder(order);
    setFormData(order || {
      customerId: '',
      products: [{ productId: '', quantity: 1 }],
      total: 0
    });
    setValidation({});
    setShowModal(true);
  };

  const calculateTotal = (orderProducts) => {
    return orderProducts.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    const newTotal = calculateTotal(newProducts);
    setFormData({ ...formData, products: newProducts, total: newTotal });
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { productId: '', quantity: 1 }]
    });
  };

  const removeProductLine = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const newTotal = calculateTotal(newProducts);
    setFormData({ ...formData, products: newProducts, total: newTotal });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.customerId) errors.customerId = 'Customer is required';
    if (!formData.products.length) errors.products = 'At least one product is required';
    formData.products.forEach((product, index) => {
      if (!product.productId) errors[`product${index}`] = 'Product is required';
      if (product.quantity < 1) errors[`quantity${index}`] = 'Quantity must be at least 1';
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    try {
      setLoading(true);
      if (modalMode === 'add') {
        await orderAPI.create(formData);
        setShowAlert({ show: true, message: 'Order created successfully', variant: 'success' });
      } else {
        await orderAPI.update(selectedOrder.id, formData);
        setShowAlert({ show: true, message: 'Order updated successfully', variant: 'success' });
      }
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      setShowAlert({ show: true, message: error.message || 'An error occurred', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        setLoading(true);
        await orderAPI.delete(id);
        setShowAlert({ show: true, message: 'Order deleted successfully', variant: 'success' });
        fetchOrders();
      } catch (error) {
        setShowAlert({ show: true, message: error.message || 'Failed to delete order', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const filteredOrders = orders.filter(order => {
    const customerName = getCustomerName(order.customerId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return customerName.includes(searchLower) || order.id.toString().includes(searchLower);
  });

  return (
    <Container fluid className="p-0">
      {showAlert.show && (
        <Alert 
          variant={showAlert.variant}
          onClose={() => setShowAlert({ show: false, message: '', variant: 'success' })}
          dismissible
          className="mb-3"
        >
          {showAlert.message}
        </Alert>
      )}

      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <InputGroup className="w-50">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={() => handleModalShow('add')}>
              <FaPlus className="me-2" />
              New Order
            </Button>
          </div>
        </Col>
      </Row>

      <Table hover responsive className="align-middle">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>
                <Badge bg="secondary">#{order.id}</Badge>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <FaUser className="text-primary me-2" />
                  {getCustomerName(order.customerId)}
                </div>
              </td>
              <td>
                <div className="d-flex flex-column">
                  {order.products.map((item, index) => (
                    <small key={index}>
                      {item.quantity}x {getProductName(item.productId)}
                    </small>
                  ))}
                </div>
              </td>
              <td>
                <div className="fw-bold text-success">
                  <FaDollarSign className="me-1" />
                  {parseFloat(order.total).toFixed(2)}
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-muted me-2" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleModalShow('edit', order)}
                    title="Edit Order"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(order.id)}
                    title="Delete Order"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4">
                <div className="text-muted">
                  No orders found{searchTerm ? ' matching your search' : ''}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Create New Order' : 'Edit Order'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Select
                value={formData.customerId || ''}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                isInvalid={!!validation.customerId}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {validation.customerId}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Products</Form.Label>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addProductLine}
                >
                  <FaPlus className="me-1" />
                  Add Product
                </Button>
              </div>
              {formData.products.map((product, index) => (
                <Row key={index} className="mb-2">
                  <Col md={6}>
                    <Form.Select
                      value={product.productId || ''}
                      onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                      isInvalid={!!validation[`product${index}`]}
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${parseFloat(p.price).toFixed(2)}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validation[`product${index}`]}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text>Qty</InputGroup.Text>
                      <Form.Control
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                        isInvalid={!!validation[`quantity${index}`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validation[`quantity${index}`]}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeProductLine(index)}
                      disabled={formData.products.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="fw-bold">Total:</div>
              <div className="h4 mb-0 text-success">
                <FaDollarSign />
                {formData.total.toFixed(2)}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {modalMode === 'add' ? 'Create Order' : 'Update Order'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default OrderManagement;
