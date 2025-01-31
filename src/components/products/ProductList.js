import React, { useEffect, useState } from 'react';
import { Table, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const ProductList = () => {
  const { products, setProducts, setLoading, setError } = useAppContext();
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setProducts(prev => prev.filter(product => product.id !== id));
        setShowAlert({
          show: true,
          message: 'Product deleted successfully',
          variant: 'success'
        });
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

  const getStockStatus = (stockLevel) => {
    if (stockLevel <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (stockLevel <= 10) {
      return <Badge bg="warning">Low Stock</Badge>;
    }
    return <Badge bg="success">In Stock</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <Button
          as={Link}
          to="/products/new"
          variant="primary"
        >
          Add New Product
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
            <th>Name</th>
            <th>Price</th>
            <th>Stock Level</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stockLevel}</td>
              <td>{getStockStatus(product.stockLevel)}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    as={Link}
                    to={`/products/${product.id}`}
                    variant="info"
                    size="sm"
                  >
                    <FaEye />
                  </Button>
                  <Button
                    as={Link}
                    to={`/products/${product.id}/edit`}
                    variant="warning"
                    size="sm"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductList;
