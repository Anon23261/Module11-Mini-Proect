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
  FaBox,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDollarSign,
  FaBoxes,
  FaImage,
  FaTag
} from 'react-icons/fa';
import { productAPI } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const ProductManagement = () => {
  const { setLoading, setError } = useAppContext();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
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
  const [validation, setValidation] = useState({});

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleModalShow = (mode, product = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setFormData(product || {
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
    setValidation({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Product name is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.price) errors.price = 'Price is required';
    else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Please enter a valid price greater than 0';
    }
    if (!formData.stockLevel && formData.stockLevel !== 0) errors.stockLevel = 'Stock level is required';
    else if (isNaN(formData.stockLevel) || parseInt(formData.stockLevel) < 0) {
      errors.stockLevel = 'Stock level must be 0 or greater';
    }
    if (formData.imageUrl && !/^https?:\\/\\/.+/.test(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
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
      const payload = {
        ...formData,
        price: parseFloat(formData.price).toFixed(2),
        stockLevel: parseInt(formData.stockLevel),
        lastUpdated: new Date().toISOString()
      };

      if (modalMode === 'add') {
        await productAPI.create(payload);
        setShowAlert({ show: true, message: 'Product added successfully', variant: 'success' });
      } else {
        await productAPI.update(selectedProduct.id, payload);
        setShowAlert({ show: true, message: 'Product updated successfully', variant: 'success' });
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      setShowAlert({ show: true, message: error.message || 'An error occurred', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await productAPI.delete(id);
        setShowAlert({ show: true, message: 'Product deleted successfully', variant: 'success' });
        fetchProducts();
      } catch (error) {
        setShowAlert({ show: true, message: error.message || 'Failed to delete product', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    }
  };

  const getStockLevelVariant = (level) => {
    if (level <= 0) return 'danger';
    if (level <= 10) return 'warning';
    return 'success';
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={() => handleModalShow('add')}>
              <FaPlus className="me-2" />
              Add Product
            </Button>
          </div>
        </Col>
      </Row>

      <Table hover responsive className="align-middle">
        <thead>
          <tr>
            <th>Product Details</th>
            <th>Price & Stock</th>
            <th>Category</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded p-2 me-3">
                    <FaBox className="text-primary" />
                  </div>
                  <div>
                    <div className="fw-bold">{product.name}</div>
                    <small className="text-muted d-block">{product.description}</small>
                    {product.sku && (
                      <small className="text-muted">SKU: {product.sku}</small>
                    )}
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div className="fw-bold">
                    <FaDollarSign className="text-success" />
                    {parseFloat(product.price).toFixed(2)}
                  </div>
                  <Badge bg={getStockLevelVariant(product.stockLevel)}>
                    {product.stockLevel} in stock
                  </Badge>
                </div>
              </td>
              <td>
                {product.category ? (
                  <Badge bg="info" className="text-dark">
                    <FaTag className="me-1" />
                    {product.category}
                  </Badge>
                ) : (
                  <span className="text-muted">Uncategorized</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-2 justify-content-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleModalShow('edit', product)}
                    title="Edit Product"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    title="Delete Product"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-4">
                <div className="text-muted">
                  No products found{searchTerm ? ' matching your search' : ''}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaBox />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isInvalid={!!validation.name}
                      placeholder="Enter product name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.name}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    isInvalid={!!validation.description}
                    placeholder="Product description"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validation.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaDollarSign />
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          isInvalid={!!validation.price}
                          placeholder="0.00"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validation.price}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Level</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaBoxes />
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          value={formData.stockLevel || ''}
                          onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                          isInvalid={!!validation.stockLevel}
                          placeholder="0"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validation.stockLevel}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaTag />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Product category"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaImage />
                    </InputGroup.Text>
                    <Form.Control
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      isInvalid={!!validation.imageUrl}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validation.imageUrl}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.sku || ''}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Stock Keeping Unit"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.brand || ''}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Product brand"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Features</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.features || ''}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Key product features"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {modalMode === 'add' ? 'Add Product' : 'Update Product'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductManagement;
