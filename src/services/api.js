import axios from 'axios';

// Configure axios with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Customer API calls
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', {
    name: data.name,
    email: data.email,
    phone_number: data.phone // Map phone to phone_number for backend
  }),
  update: (id, data) => api.put(`/customers/${id}`, {
    name: data.name,
    email: data.email,
    phone_number: data.phone
  }),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Product API calls
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', {
    name: data.name,
    price: parseFloat(data.price),
    stock_level: parseInt(data.stockLevel)
  }),
  update: (id, data) => api.put(`/products/${id}`, {
    name: data.name,
    price: parseFloat(data.price),
    stock_level: parseInt(data.stockLevel)
  }),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, quantity) => api.put(`/products/${id}`, {
    stock_level: parseInt(quantity)
  }),
};

// Order API calls
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', {
    customer_id: parseInt(data.customerId),
    order_date: data.orderDate,
    products: data.products.map(item => ({
      product_id: item.productId,
      quantity: parseInt(item.quantity)
    }))
  }),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getCustomerOrders: (customerId) => api.get(`/customers/${customerId}/orders`),
};

// Add response interceptor to transform backend data to frontend format
api.interceptors.response.use(response => {
  // Transform customer data
  if (Array.isArray(response.data) && response.data[0]?.phone_number) {
    response.data = response.data.map(customer => ({
      ...customer,
      phone: customer.phone_number,
      id: customer.id
    }));
  }
  
  // Transform single customer data
  if (response.data?.phone_number) {
    response.data = {
      ...response.data,
      phone: response.data.phone_number,
      id: response.data.id
    };
  }

  // Transform product data
  if (Array.isArray(response.data) && response.data[0]?.stock_level) {
    response.data = response.data.map(product => ({
      ...product,
      stockLevel: product.stock_level,
      id: product.id
    }));
  }

  // Transform single product data
  if (response.data?.stock_level) {
    response.data = {
      ...response.data,
      stockLevel: response.data.stock_level,
      id: response.data.id
    };
  }

  return response;
});

export default api;
