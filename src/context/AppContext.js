import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic error handler
  const handleError = useCallback((error, customMessage = 'An error occurred') => {
    const errorMessage = error.response?.data?.message || error.message || customMessage;
    setError(errorMessage);
    toast.error(errorMessage);
    console.error('Error:', error);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Success notification
  const showSuccess = useCallback((message) => {
    toast.success(message);
  }, []);

  const value = {
    // State
    customers,
    setCustomers,
    products,
    setProducts,
    orders,
    setOrders,
    loading,
    setLoading,
    error,
    setError,

    // Utility functions
    handleError,
    clearError,
    showSuccess,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
