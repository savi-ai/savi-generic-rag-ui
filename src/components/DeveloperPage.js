import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, FormControlLabel, Checkbox, TextField } from '@mui/material';
import DeveloperForm from './DeveloperForm';
import ResponseDisplay from './ResponseDisplay';
import formConfig from '../config/formConfig.json';

function DeveloperPage() {
  const [response, setResponse] = useState(null);
  const [isVector, setIsVector] = useState(false);
  const [topK, setTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [useSelfCritic, setUseSelfCritic] = useState(false);

  const handleSubmit = async (formData, mode = 'test') => {
    try {
      // Create llmParameters object
      const llmParameters = {
        isVector,
        topK: isVector ? topK : undefined,
        temperature: parseFloat(temperature),
        maxTokens: parseInt(maxTokens),
        useSelfCritic
      };

      // Structure the request with separate objects
      const requestData = {
        ...formData,
        llmParameters
      };

      // Determine endpoint based on mode
      let endpoint;
      if (mode === 'evaluation') {
        endpoint = formConfig.runEvaluationsApiEndpoint || formConfig.apiEndpoint;
      } else {
        // test mode
        endpoint = formConfig.testApiEndpoint || formConfig.apiEndpoint;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
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
        Developer RAG Application
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Parameters
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
            <TextField
              label="Temperature"
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
              fullWidth
              margin="normal"
              inputProps={{ 
                min: 0, 
                max: 2, 
                step: 0.1 
              }}
              helperText="Controls randomness in the response (0.0 = deterministic, 2.0 = very random)"
            />
            <TextField
              label="Number of Tokens Generated"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1000)}
              fullWidth
              margin="normal"
              inputProps={{ 
                min: 1, 
                max: 4000 
              }}
              helperText="Maximum number of tokens to generate in the response"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSelfCritic}
                  onChange={(e) => setUseSelfCritic(e.target.checked)}
                />
              }
              label="Use Self Critic"
            />
          </Paper>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Developer Variables
            </Typography>
            <DeveloperForm 
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

export default DeveloperPage; 