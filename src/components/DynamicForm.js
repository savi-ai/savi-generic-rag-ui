import React, { useState } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText
} from '@mui/material';

const DynamicForm = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.id,
      label: field.label,
      value: formData[field.id] || '',
      onChange: (e) => handleChange(field.id, e.target.value),
      required: field.required,
      error: !!errors[field.id],
      helperText: errors[field.id],
      fullWidth: true,
      margin: 'normal',
      placeholder: field.placeholder
    };

    switch (field.type) {
      case 'select':
        return (
          <FormControl
            key={field.id}
            fullWidth
            margin="normal"
            required={field.required}
            error={!!errors[field.id]}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              label={field.label}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {errors[field.id] && (
              <FormHelperText error>{errors[field.id]}</FormHelperText>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            key={field.id}
            {...commonProps}
            multiline
            rows={4}
          />
        );

      default:
        return (
          <TextField
            key={field.id}
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {fields.map(renderField)}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default DynamicForm; 