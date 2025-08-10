import React, { useState } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Typography,
  Radio,
  RadioGroup
} from '@mui/material';
import ConfirmationDialog from './ConfirmationDialog';

const DeveloperForm = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('test'); // 'test', 'evaluation'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

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
    
    // Skip validation for form fields when in evaluation mode since they're hidden
    if (mode !== 'evaluation') {
      fields.forEach(field => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Include system prompt in the form data
      const enrichedFormData = {
        ...formData,
        systemPrompt: systemPrompt.trim()
      };

      if (mode === 'evaluation') {
        setShowConfirmation(true);
      } else {
        onSubmit(enrichedFormData, mode);
      }
    }
  };

  const handleConfirmEvaluation = () => {
    setShowConfirmation(false);
    const enrichedFormData = {
      ...formData,
      systemPrompt: systemPrompt.trim()
    };
    onSubmit(enrichedFormData, 'evaluation');
  };

  const handleCancelEvaluation = () => {
    setShowConfirmation(false);
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
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* System Prompt Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Prompt
          </Typography>
          <TextField
            label="System Prompt"
            multiline
            rows={6}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="Enter the system prompt that will guide the AI's behavior..."
            helperText="This prompt will be used to set the context and behavior for the AI response"
          />
        </Box>

        {/* Mode Selection Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Execution Mode
          </Typography>
          <RadioGroup
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            row
          >
            <FormControlLabel
              value="test"
              control={<Radio />}
              label="Test"
            />
            <FormControlLabel
              value="evaluation"
              control={<Radio />}
              label="Evaluation"
            />
          </RadioGroup>
        </Box>

        {/* Dynamic Fields Section - Hidden when evaluation mode is selected */}
        {mode !== 'evaluation' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Input Values
            </Typography>
            {fields.map(renderField)}
          </Box>
        )}

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
      
      <ConfirmationDialog
        open={showConfirmation}
        onClose={handleCancelEvaluation}
        onConfirm={handleConfirmEvaluation}
        title="Confirm Evaluation"
        message="Are you sure you want to run evaluation? This will use the evaluation endpoint instead of the standard submission endpoint."
      />
    </>
  );
};

export default DeveloperForm; 