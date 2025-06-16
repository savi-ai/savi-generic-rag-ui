import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, FormControlLabel, Checkbox, TextField } from '@mui/material';
import DynamicForm from './components/DynamicForm';
import ResponseDisplay from './components/ResponseDisplay';
import formConfig from './config/formConfig.json';

function App() {
  const [response, setResponse] = useState(null);
  const [isVector, setIsVector] = useState(false);
  const [topK, setTopK] = useState(5);

  const handleSubmit = async (formData) => {
    try {
      // Add the standard fields to the form data
      const enrichedFormData = {
        ...formData,
        isVector,
        topK: isVector ? topK : undefined
      };

      const response = await fetch(formConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedFormData),
      });
      const data = await response.json();
      setResponse(data);
    } catch (error) {
      setResponse({
        status: 'error',
        message: 'Failed to submit form: ' + error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Simple RAG Application
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Type
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!isVector}
                    onChange={(e) => setIsVector(!e.target.checked)}
                  />
                }
                label="Full PDF"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isVector}
                    onChange={(e) => setIsVector(e.target.checked)}
                  />
                }
                label="Vector"
              />
            </Box>
            {isVector && (
              <TextField
                label="Top K"
                type="number"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
                fullWidth
                margin="normal"
                inputProps={{ min: 1, max: 100 }}
              />
            )}
          </Paper>
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
            <ResponseDisplay 
              response={response} 
              fields={formConfig.responseFields} 
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App; 