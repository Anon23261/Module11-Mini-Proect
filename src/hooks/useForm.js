import { useState } from 'react';

const useForm = (initialState = {}, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = (data) => {
    const newErrors = {};
    
    // Add validation rules based on field names
    Object.entries(data).forEach(([key, value]) => {
      if (!value && value !== 0) {
        newErrors[key] = `${key} is required`;
      }
      
      // Email validation
      if (key === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[key] = 'Invalid email format';
      }
      
      // Phone validation
      if (key === 'phone' && value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
        newErrors[key] = 'Invalid phone number format';
      }
      
      // Price validation
      if (key === 'price' && value && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[key] = 'Price must be a positive number';
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSubmit(formData);
        // Reset form after successful submission
        setFormData(initialState);
      } catch (error) {
        console.error('Form submission error:', error);
        setErrors({ submit: 'An error occurred while submitting the form' });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    handleChange,
    handleSubmit
  };
};

export default useForm;
