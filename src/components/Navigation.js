import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          RAG Experimentation
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{
              backgroundColor: location.pathname === '/' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Simple RAG
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/developer"
            sx={{
              backgroundColor: location.pathname === '/developer' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}
          >
            Developer
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation; 