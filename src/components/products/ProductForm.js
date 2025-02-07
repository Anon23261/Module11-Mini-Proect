import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Container, Card, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { FaBox, FaTag, FaDollarSign, FaImage, FaListAlt, FaBoxes } from 'react-icons/fa';



const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading } = useAppContext();
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockLevel: '',
    imageUrl: '',
    category: '',
    sku: '',
    brand: '',
    weight: '',
    dimensions: '',
    features: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.stockLevel) {
      newErrors.stockLevel = 'Stock level is required';
    } else if (isNaN(formData.stockLevel) || parseInt(formData.stockLevel) < 0) {
      newErrors.stockLevel = 'Stock level must be a non-negative number';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL starting with http:// or https://';
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
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        stockLevel: parseInt(formData.stockLevel, 10)
      };

      if (id) {
        await productAPI.update(id, processedData);
        setAlert({
          show: true,
          message: 'Product updated successfully!',
          variant: 'success'
        });
      } else {
        await productAPI.create(processedData);
        setAlert({
          show: true,
          message: 'Product created successfully!',
          variant: 'success'
        });
      }
      
      // Wait a moment to show the success message
      setTimeout(() => navigate('/products'), 1500);
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
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await productAPI.getById(id);
          const { data } = response;
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            stockLevel: data.stock?.toString() || '',
            imageUrl: data.imageUrl || ''
          });
        } catch (error) {
          setAlert({
            show: true,
            message: error.message || 'Failed to fetch product',
            variant: 'danger'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProduct();
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
            <h2 className="mb-0">{id ? 'Edit Product' : 'Add New Product'}</h2>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate('/products')}
            >
              ← Back to Products
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                placeholder="Enter product name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description}
                placeholder="Enter product description"
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Minimum 10 characters required
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price *</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  isInvalid={!!errors.price}
                  placeholder="0.00"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock Level *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="1"
                name="stockLevel"
                value={formData.stockLevel}
                onChange={handleChange}
                isInvalid={!!errors.stockLevel}
                placeholder="Enter stock quantity"
              />
              <Form.Control.Feedback type="invalid">
                {errors.stockLevel}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                isInvalid={!!errors.imageUrl}
                placeholder="https://example.com/image.jpg"
              />
              <Form.Control.Feedback type="invalid">
                {errors.imageUrl}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Optional: Add a URL for the product image
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/products')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
              >
                {id ? 'Update' : 'Create'} Product
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
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
