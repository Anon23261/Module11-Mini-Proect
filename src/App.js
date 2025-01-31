import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/common/Navigation';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import CustomerDetails from './components/customers/CustomerDetails';
import ProductList from './components/products/ProductList';
import ProductForm from './components/products/ProductForm';
import ProductDetails from './components/products/ProductDetails';
import OrderForm from './components/orders/OrderForm';
import OrderHistory from './components/orders/OrderHistory';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Container className="mt-4">
        <Routes>
          {/* Customer Routes */}
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          
          {/* Product Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          
          {/* Order Routes */}
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/history" element={<OrderHistory />} />
          
          {/* Default Route */}
          <Route path="/" element={<ProductList />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
