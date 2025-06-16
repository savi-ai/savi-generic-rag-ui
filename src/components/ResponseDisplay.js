import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const ResponseDisplay = ({ response, fields }) => {
  if (!response) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Typography color="text.secondary">
          Submit the form to see the response
        </Typography>
      </Box>
    );
  }

  if (response.status === 'loading') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {fields.map((field) => (
        <Paper
          key={field.id}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: response.status === 'error' ? '#ffebee' : '#f5f5f5'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {field.label}
          </Typography>
          <Typography variant="body1">
            {response[field.id] || 'N/A'}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ResponseDisplay; 