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
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', {
    name: data.name,
    email: data.email,
    phone: data.phone
  }),
  update: (id, data) => api.put(`/customers/${id}`, {
    name: data.name,
    email: data.email,
    phone: data.phone
  }),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Product API calls
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    stock: parseInt(data.stock, 10)
  }),
  update: (id, data) => api.put(`/products/${id}`, {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    stock: parseInt(data.stock, 10)
  }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, quantity) => api.patch(`/products/${id}/stock`, { quantity })
};

// Order API calls
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', {
    customerId: data.customerId,
    products: data.products.map(item => ({
      productId: item.productId,
      quantity: parseInt(item.quantity, 10)
    })),
    total: parseFloat(data.total)
  }),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getCustomerOrders: (customerId) => api.get(`/customers/${customerId}/orders`)
};

// Data transformation helpers
const transformCustomer = (customer) => ({
  ...customer,
  phone: customer.phone_number || customer.phone
});

const transformProduct = (product) => ({
  ...product,
  price: parseFloat(product.price),
  stock: parseInt(product.stock, 10)
});

const transformOrder = (order) => ({
  ...order,
  total: parseFloat(order.total),
  products: order.products.map(item => ({
    ...item,
    quantity: parseInt(item.quantity, 10)
  }))
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
