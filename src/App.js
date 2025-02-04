import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
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
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <>
      <Navigation />
      <Container className="mt-4">
        <Routes future={{ v7_startTransition: true }}>
          {/* Customer Routes */}
          <Route path="customers">
            <Route index element={<CustomerList />} />
            <Route path="new" element={<CustomerForm />} />
            <Route path=":id">
              <Route index element={<CustomerDetails />} />
              <Route path="edit" element={<CustomerForm />} />
            </Route>
          </Route>
          
          {/* Product Routes */}
          <Route path="products">
            <Route index element={<ProductList />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id">
              <Route index element={<ProductDetails />} />
              <Route path="edit" element={<ProductForm />} />
            </Route>
          </Route>

          {/* Order Routes */}
          <Route path="orders">
            <Route index element={<OrderHistory />} />
            <Route path="new" element={<OrderForm />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/products" replace />} />
        </Routes>
      </Container>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
