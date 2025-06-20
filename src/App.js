import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import SimpleRAGPage from './components/SimpleRAGPage';
import DeveloperPage from './components/DeveloperPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Navigation />
        <Routes>
          <Route path="/" element={<SimpleRAGPage />} />
          <Route path="/developer" element={<DeveloperPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App; 