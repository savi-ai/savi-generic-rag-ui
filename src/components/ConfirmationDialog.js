import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WarningIcon color="warning" />
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Evaluation Mode</AlertTitle>
          This action will use the evaluation endpoint instead of the standard submission endpoint.
        </Alert>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="warning"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
          }}
        >
          Run Evaluation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 