import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaGlobe } from 'react-icons/fa';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading } = useAppContext();
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    website: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.address && formData.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setAlert({
        show: true,
        message: 'Please fix the errors before submitting',
        variant: 'danger'
      });
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await customerAPI.update(id, formData);
        setAlert({
          show: true,
          message: 'Customer updated successfully!',
          variant: 'success'
        });
      } else {
        await customerAPI.create(formData);
        setAlert({
          show: true,
          message: 'Customer created successfully!',
          variant: 'success'
        });
      }
      
      // Wait a moment to show the success message
      setTimeout(() => navigate('/customers'), 1500);
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'An error occurred',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await customerAPI.getById(id);
          const { data } = response;
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        } catch (error) {
          setAlert({
            show: true,
            message: error.message || 'Failed to fetch customer details',
            variant: 'danger'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomer();
  }, [id, setLoading]);

  return (
    <Container className="py-4">
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{id ? 'Edit Customer' : 'Add New Customer'}</h2>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/customers')}
            >
              ← Back to Customers
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="Enter customer's full name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="example@email.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
                placeholder="+1 (555) 123-4567"
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter phone number with country code
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                placeholder="Enter complete address"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Optional: Enter the complete shipping address
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/customers')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                {id ? 'Update' : 'Create'} Customer
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerForm;
