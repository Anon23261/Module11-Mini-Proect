import React, { useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import useForm from '../../hooks/useForm';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading, setError } = useAppContext();
  
  const initialState = {
    name: '',
    email: '',
    phone: ''
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      if (id) {
        await customerAPI.update(id, formData);
      } else {
        await customerAPI.create(formData);
      }
      navigate('/customers');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const {
    formData,
    setFormData,
    errors,
    handleChange,
    handleSubmit
  } = useForm(initialState, onSubmit);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await customerAPI.getById(id);
          setFormData(response.data);
        } catch (error) {
          setError('Failed to fetch customer details');
          console.error('Error fetching customer:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCustomer();
  }, [id, setFormData, setLoading, setError]);

  return (
    <div>
      <h2>{id ? 'Edit Customer' : 'Add New Customer'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            isInvalid={!!errors.phone}
          />
          <Form.Control.Feedback type="invalid">
            {errors.phone}
          </Form.Control.Feedback>
        </Form.Group>

        {errors.submit && (
          <Alert variant="danger" className="mb-3">
            {errors.submit}
          </Alert>
        )}

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            {id ? 'Update' : 'Create'} Customer
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/customers')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CustomerForm;
