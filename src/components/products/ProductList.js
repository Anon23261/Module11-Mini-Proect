import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const ProductList = () => {
  const { products, setProducts, setLoading, setError } = useAppContext();
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [localError, setLocalError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setLocalError(null);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to connect to the server. Please ensure the backend server is running.';
      setLocalError(errorMessage);
      setError(errorMessage);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setLocalError, setError, setProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      let compareA = a[sortField];
      let compareB = b[sortField];
      
      if (sortField === 'price') {
        compareA = parseFloat(compareA);
        compareB = parseFloat(compareB);
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sorted);
  }, [products, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Description', 'Price', 'Stock Level', 'Category', 'Last Updated'],
      ...filteredProducts.map(product => [
        product.name,
        product.description,
        product.price,
        product.stockLevel,
        product.category || 'Uncategorized',
        product.lastUpdated || new Date().toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockLevelVariant = (level) => {
    if (level <= 0) return 'danger';
    if (level <= 10) return 'warning';
    return 'success';
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Product Management</h2>
            <div className="d-flex gap-2">
              <Button
                variant="outline-secondary"
                onClick={handleExport}
                title="Export to CSV"
              >
                <FaDownload /> Export
              </Button>
              <Button
                as={Link}
                to="/products/new"
                variant="primary"
              >
                <FaPlus className="me-1" /> Add Product
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
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

      {localError && (
        <Alert variant="danger" onClose={() => setLocalError(null)} dismissible>
          {localError}
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
