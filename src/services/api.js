import axios from 'axios';

// Configure axios with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for error handling
api.interceptors.request.use(
  config => {
    // Add any request preprocessing here
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject({
      message: 'Failed to send request. Please check your connection.'
    });
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Transform successful response data here if needed
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timed out. Please check your connection.'
      });
    }
    if (!error.response) {
      return Promise.reject({
        message: 'Unable to connect to the server. Please ensure the backend is running.'
      });
    }
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        return Promise.reject({
          message: error.response.data.message || 'Invalid request. Please check your input.'
        });
      case 401:
        return Promise.reject({
          message: 'Unauthorized. Please log in again.'
        });
      case 403:
        return Promise.reject({
          message: 'Access denied. You do not have permission to perform this action.'
        });
      case 404:
        return Promise.reject({
          message: 'Resource not found.'
        });
      case 500:
        return Promise.reject({
          message: 'Server error. Please try again later.'
        });
      default:
        return Promise.reject({
          message: error.response.data.message || 'An unexpected error occurred.'
        });
    }
  }
);

// Customer API calls
export const customerAPI = {
  getAll: () => api.get('/api/customers'),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    company: data.company,
    website: data.website,
    notes: data.notes,
    status: data.status || 'active'
  }),
  update: (id, data) => api.put(`/api/customers/${id}`, {
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    company: data.company,
    website: data.website,
    notes: data.notes,
    status: data.status || 'active'
  }),
  delete: (id) => api.delete(`/api/customers/${id}`)
};

// Product API calls
export const productAPI = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    stock_level: parseInt(data.stockLevel, 10),
    image_url: data.imageUrl,
    category: data.category,
    sku: data.sku,
    brand: data.brand,
    weight: parseFloat(data.weight),
    dimensions: data.dimensions,
    features: data.features
  }),
  update: (id, data) => api.put(`/api/products/${id}`, {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    stock_level: parseInt(data.stockLevel, 10),
    image_url: data.imageUrl,
    category: data.category,
    sku: data.sku,
    brand: data.brand,
    weight: parseFloat(data.weight),
    dimensions: data.dimensions,
    features: data.features
  }),
  delete: (id) => api.delete(`/api/products/${id}`),
  updateStock: (id, quantity) => api.patch(`/api/products/${id}/stock`, { quantity })
};

// Order API calls
export const orderAPI = {
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders', {
    customer_id: data.customerId,
    items: data.products.map(item => ({
      product_id: item.productId,
      quantity: parseInt(item.quantity, 10)
    }))
  }),
  update: (id, data) => api.put(`/api/orders/${id}`, {
    status: data.status
  }),
  delete: (id) => api.delete(`/api/orders/${id}`),
  getCustomerOrders: (customerId) => api.get(`/api/orders/customer/${customerId}`)
};

// Data transformation helpers
const transformCustomer = (customer) => ({
  ...customer,
  lastUpdated: customer.updated_at,
  createdAt: customer.created_at
});

const transformProduct = (product) => ({
  ...product,
  price: parseFloat(product.price),
  stockLevel: product.stock_level,
  imageUrl: product.image_url,
  lastUpdated: product.updated_at,
  createdAt: product.created_at
});

const transformOrder = (order) => ({
  ...order,
  customerId: order.customer_id,
  total: parseFloat(order.total),
  items: order.items.map(item => ({
    ...item,
    productId: item.product_id,
    quantity: parseInt(item.quantity, 10),
    product: transformProduct(item.product)
  })),
  lastUpdated: order.updated_at,
  createdAt: order.created_at
});

// Add response interceptor to transform backend data to frontend format
api.interceptors.response.use(
  response => {
    if (response.config.url.includes('/customers')) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformCustomer);
      } else {
        response.data = transformCustomer(response.data);
      }
    }
    if (response.config.url.includes('/products')) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformProduct);
      } else {
        response.data = transformProduct(response.data);
      }
    }
    if (response.config.url.includes('/orders')) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformOrder);
      } else {
        response.data = transformOrder(response.data);
      }
    }
    return response;
  }
);

export default api;
