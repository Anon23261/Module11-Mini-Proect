import React, { useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import useForm from '../../hooks/useForm';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading, setError } = useAppContext();
  
  const initialState = {
    name: '',
    price: '',
    stockLevel: '',
    description: ''
  };

  const onSubmit = async (formData) => {
    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      price: parseFloat(formData.price),
      stockLevel: parseInt(formData.stockLevel, 10)
    };

    try {
      setLoading(true);
      if (id) {
        await productAPI.update(id, processedData);
      } else {
        await productAPI.create(processedData);
      }
      navigate('/products');
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
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await productAPI.getById(id);
          setFormData(response.data);
        } catch (error) {
          setError('Failed to fetch product details');
          console.error('Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id, setFormData, setLoading, setError]);

  return (
    <div>
      <h2>{id ? 'Edit Product' : 'Add New Product'}</h2>
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
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={formData.price}
            onChange={handleChange}
            isInvalid={!!errors.price}
          />
          <Form.Control.Feedback type="invalid">
            {errors.price}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Stock Level</Form.Label>
          <Form.Control
            type="number"
            min="0"
            name="stockLevel"
            value={formData.stockLevel}
            onChange={handleChange}
            isInvalid={!!errors.stockLevel}
          />
          <Form.Control.Feedback type="invalid">
            {errors.stockLevel}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            isInvalid={!!errors.description}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description}
          </Form.Control.Feedback>
        </Form.Group>

        {errors.submit && (
          <Alert variant="danger" className="mb-3">
            {errors.submit}
          </Alert>
        )}

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            {id ? 'Update' : 'Create'} Product
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductForm;
