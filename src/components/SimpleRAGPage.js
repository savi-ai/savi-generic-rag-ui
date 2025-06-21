import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import DynamicForm from './DynamicForm';
import ResponseDisplay from './ResponseDisplay';

function SimpleRAGPage() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState('generic');
  const [formConfig, setFormConfig] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Use case options
  const useCases = [
    { value: 'generic', label: 'Generic Form' },
    { value: 'chatbot', label: 'Chatbot Assistant' },
    { value: 'document-analysis', label: 'Document Analysis' },
    { value: 'customer-support', label: 'Customer Support' }
  ];

  // Load configuration based on selected use case
  useEffect(() => {
    const loadConfig = async () => {
      setIsConfigLoading(true);
      try {
        let configModule;
        switch (selectedUseCase) {
          case 'chatbot':
            configModule = await import('../config/chatbot-formConfig.json');
            break;
          case 'document-analysis':
            configModule = await import('../config/document-analysis-formConfig.json');
            break;
          case 'customer-support':
            configModule = await import('../config/customer-support-formConfig.json');
            break;
          default:
            configModule = await import('../config/generic-formConfig.json');
        }
        setFormConfig(configModule.default);
      } catch (error) {
        console.error('Error loading config:', error);
        // Fallback to generic config
        const fallbackConfig = await import('../config/generic-formConfig.json');
        setFormConfig(fallbackConfig.default);
      } finally {
        setIsConfigLoading(false);
      }
    };

    loadConfig();
  }, [selectedUseCase]);

  const handleSubmit = async (formData) => {
    if (!formConfig) return;
    
    try {
      setIsLoading(true);
      setResponse(null);

      const response = await fetch(formConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        status: 'error',
        message: 'Failed to submit form: ' + error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfigLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Loading configuration...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Test Page
      </Typography>
      
      {/* Use Case Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Use Case Selection
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Select Use Case</InputLabel>
          <Select
            value={selectedUseCase}
            onChange={(e) => setSelectedUseCase(e.target.value)}
            label="Select Use Case"
          >
            {useCases.map((useCase) => (
              <MenuItem key={useCase.value} value={useCase.value}>
                {useCase.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose a use case to load the appropriate form configuration and API endpoint.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Input Parameters
            </Typography>
            {formConfig && (
              <DynamicForm 
                fields={formConfig.formFields} 
                onSubmit={handleSubmit} 
              />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={60} />
                <Typography variant="body1" color="text.secondary">
                  Processing your request...
                </Typography>
              </Box>
            ) : (
              formConfig && (
                <ResponseDisplay 
                  response={response} 
                  fields={formConfig.responseFields} 
                />
              )
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SimpleRAGPage; 