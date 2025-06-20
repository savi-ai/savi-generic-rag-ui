import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import DynamicForm from './DynamicForm';
import ResponseDisplay from './ResponseDisplay';
import formConfig from '../config/formConfig.json';

function SimpleRAGPage() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setResponse(null); // Clear previous response

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Simple RAG Application
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prompt Variables
            </Typography>
            <DynamicForm 
              fields={formConfig.formFields} 
              onSubmit={handleSubmit} 
            />
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
              <ResponseDisplay 
                response={response} 
                fields={formConfig.responseFields} 
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default SimpleRAGPage; 