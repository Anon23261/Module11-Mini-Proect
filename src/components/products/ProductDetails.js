import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, ListGroup, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setLoading, setError } = useAppContext();
  const [product, setProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      setError('Failed to fetch product details');
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError, setProduct]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setShowAlert({
          show: true,
          message: 'Product deleted successfully',
          variant: 'success'
        });
        setTimeout(() => navigate('/products'), 1500);
      } catch (error) {
        setShowAlert({
          show: true,
          message: 'Failed to delete product',
          variant: 'danger'
        });
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    const quantity = parseInt(stockAdjustment, 10);
    
    if (isNaN(quantity)) {
      setShowAlert({
        show: true,
        message: 'Please enter a valid number',
        variant: 'danger'
      });
      return;
    }

    try {
      await productAPI.updateStock(id, quantity);
      const updatedProduct = await productAPI.getById(id);
      setProduct(updatedProduct.data);
      setStockAdjustment('');
      setShowAlert({
        show: true,
        message: 'Stock level updated successfully',
        variant: 'success'
      });
    } catch (error) {
      setShowAlert({
        show: true,
        message: 'Failed to update stock level',
        variant: 'danger'
      });
      console.error('Error updating stock level:', error);
    }
  };

  if (!product) {
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
          <h3 className="mb-0">Product Details</h3>
          <div className="d-flex gap-2">
            <Button
              as={Link}
              to={`/products/${id}/edit`}
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
            <strong>Name:</strong> {product.name}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Price:</strong> ${product.price.toFixed(2)}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Stock Level:</strong> {product.stockLevel}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Description:</strong> {product.description}
          </ListGroup.Item>
        </ListGroup>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h4 className="mb-0">Adjust Stock Level</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleStockAdjustment}>
            <Form.Group className="mb-3">
              <Form.Label>New Stock Level</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={stockAdjustment}
                onChange={(e) => setStockAdjustment(e.target.value)}
                placeholder="Enter new stock level"
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Update Stock
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
