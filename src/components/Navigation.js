import React from 'react';
import { AppBar, Toolbar, Typography, Box, Tabs, Tab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/developer/upload');
    } else if (newValue === 1) {
      navigate('/developer/test');
    }
  };

  // Determine which tab is active based on current route
  const getActiveTab = () => {
    if (location.pathname === '/developer/upload') return 0;
    if (location.pathname === '/developer/test') return 1;
    return 0; // default to upload tab
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          RAG Experimentation Tool
        </Typography>
        
        {/* Developer Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tabs 
            value={getActiveTab()} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': { 
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                minWidth: 'auto',
                px: 3,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 1
                }
              },
              '& .Mui-selected': {
                color: 'white !important',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab label="Upload Data" />
            <Tab label="Test" />
          </Tabs>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation; 