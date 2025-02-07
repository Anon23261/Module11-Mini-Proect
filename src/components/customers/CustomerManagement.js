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
  Alert
} from 'react-bootstrap';
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { customerAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CustomerManagement = () => {
  const { setLoading, setError } = useAppContext();
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [validation, setValidation] = useState({});

  const fetchCustomers = async () => {
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
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleModalShow = (mode, customer = null) => {
    setModalMode(mode);
    setSelectedCustomer(customer);
    setFormData(customer || {
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setValidation({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone?.trim()) errors.phone = 'Phone is required';
    else if (!/^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
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
        await customerAPI.create(formData);
        setShowAlert({ show: true, message: 'Customer added successfully', variant: 'success' });
      } else {
        await customerAPI.update(selectedCustomer.id, formData);
        setShowAlert({ show: true, message: 'Customer updated successfully', variant: 'success' });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      setShowAlert({ show: true, message: error.message || 'An error occurred', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await customerAPI.delete(id);
        setShowAlert({ show: true, message: 'Customer deleted successfully', variant: 'success' });
        fetchCustomers();
      } catch (error) {
        setShowAlert({ show: true, message: error.message || 'Failed to delete customer', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={() => handleModalShow('add')}>
              <FaUserPlus className="me-2" />
              Add Customer
            </Button>
          </div>
        </Col>
      </Row>

      <Table hover responsive className="align-middle">
        <thead>
          <tr>
            <th>Customer Details</th>
            <th>Contact Information</th>
            <th>Address</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle p-2 me-3">
                    <FaUser className="text-primary" />
                  </div>
                  <div>
                    <div className="fw-bold">{customer.name}</div>
                    <small className="text-muted">ID: {customer.id}</small>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div><FaEnvelope className="me-2 text-muted" />{customer.email}</div>
                  <div><FaPhone className="me-2 text-muted" />{customer.phone}</div>
                </div>
              </td>
              <td>
                <div>
                  <FaMapMarkerAlt className="me-2 text-muted" />
                  {customer.address || 'No address provided'}
                </div>
              </td>
              <td>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleModalShow('edit', customer)}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isInvalid={!!validation.name}
                      placeholder="Enter customer's full name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.name}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaEnvelope />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      isInvalid={!!validation.email}
                      placeholder="name@example.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.email}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaPhone />
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      isInvalid={!!validation.phone}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.phone}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaMapMarkerAlt />
                    </InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter shipping address"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {modalMode === 'add' ? 'Add Customer' : 'Update Customer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CustomerManagement;
