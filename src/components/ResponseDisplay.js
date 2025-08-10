import React, { useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Chip, Button, LinearProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

const ResponseDisplay = ({ response, fields, isTestMode = false }) => {
  const [evaluationStatus, setEvaluationStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

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

  const isSuccess = response.success === true;
  const message = response.message || 'No message provided';
  const data = response.data || {};

  const checkEvaluationStatus = async () => {
    if (!data.status_url) return;
    
    setIsCheckingStatus(true);
    try {
      const statusResponse = await fetch(`http://localhost:8000${data.status_url}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setEvaluationStatus(statusData);
      } else {
        console.error('Failed to fetch status:', statusResponse.status);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDownloadResults = () => {
    if (data.download_url) {
      // Open HTML results in new tab
      window.open(`http://localhost:8000${data.download_url}/html`, '_blank');
    }
  };

  // Determine current status (from initial response or updated status)
  const currentStatus = evaluationStatus || { success: isSuccess, data: data };
  const isEvaluationComplete = evaluationStatus?.success && evaluationStatus?.data?.status === 'completed';
  const isEvaluationInProgress = !isEvaluationComplete;

  // Handle evaluation mode responses (when data contains evaluation results)
  if (isTestMode && isSuccess && (data.task_id || data.total_queries || data.status_url)) {
    return (
      <Box>
        {/* Evaluation Status */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f5faff', border: '1px solid #e3f2fd' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Evaluation Status
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {evaluationStatus?.message || message}
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {data.task_id && (
              <Box>
                <Typography variant="caption" color="text.secondary">Task ID</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {data.task_id}
                </Typography>
              </Box>
            )}
            
            {data.usecase_id && (
              <Box>
                <Typography variant="caption" color="text.secondary">Use Case ID</Typography>
                <Typography variant="body2">{data.usecase_id}</Typography>
              </Box>
            )}
            
            {data.total_queries && (
              <Box>
                <Typography variant="caption" color="text.secondary">Total Queries</Typography>
                <Typography variant="body2">{data.total_queries}</Typography>
              </Box>
            )}

            {evaluationStatus?.data?.status && (
              <Box>
                <Typography variant="caption" color="text.secondary">Current Status</Typography>
                <Typography variant="body2" sx={{ 
                  color: isEvaluationComplete ? 'success.main' : 'warning.main',
                  fontWeight: 600
                }}>
                  {evaluationStatus.data.status.charAt(0).toUpperCase() + evaluationStatus.data.status.slice(1)}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Status and Download URLs */}
          {(data.status_url || data.download_url) && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Actions</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {data.status_url && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={isCheckingStatus ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={checkEvaluationStatus}
                    disabled={isCheckingStatus}
                  >
                    {isCheckingStatus ? 'Checking...' : 'Check Status'}
                  </Button>
                )}
                {data.download_url && (
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadResults}
                    disabled={!isEvaluationComplete}
                    color={isEvaluationComplete ? 'primary' : 'inherit'}
                  >
                    {isEvaluationComplete ? 'View Results' : 'Results Not Ready'}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
        
        {/* Progress Indicator for Running Evaluations */}
        {isEvaluationInProgress && (
          <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Evaluation Progress
            </Typography>
            <LinearProgress variant="indeterminate" />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Your evaluation is being processed. Use the "Check Status" button above to monitor progress.
            </Typography>
          </Paper>
        )}

        {/* Completion Message */}
        {isEvaluationComplete && (
          <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', border: '1px solid #4caf50' }}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
              ✅ Evaluation completed successfully! Click "View Results" to see the detailed report.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  }

  // Specialized rendering for Test mode responses (single query)
  if (isTestMode && isSuccess && (data.response || data.search_results)) {
    const answerText = data.response || '';
    const searchResults = Array.isArray(data.search_results) ? [...data.search_results] : [];

    // Sort by rank if available
    searchResults.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

    return (
      <Box>
        {/* Only show error alerts; skip success banner for cleaner UI */}
        {!isSuccess && (
          <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
        )}

        {/* Answer */}
        {answerText && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5faff', border: '1px solid #e3f2fd' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Response
            </Typography>
            <Typography variant="body1">
              {answerText}
            </Typography>
          </Paper>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Search Results
            </Typography>
            <Box>
              {searchResults.map((result, index) => {
                const rank = result.rank ?? index + 1;
                const score = typeof result.score === 'number' ? result.score.toFixed(3) : result.score;
                const filename = result.metadata?.filename || 'Unknown file';
                const filePath = result.metadata?.file_path || '';
                const content = result.content || '';

                return (
                  <Accordion key={`${filename}-${rank}-${index}`} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                      sx={{
                        '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 }
                      }}
                    >
                      <Chip label={`#${rank}`} size="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mr: 2 }}>{filename}</Typography>
                      <Typography variant="caption" color="text.secondary">score: {score}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" component="pre" sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        mb: 1
                      }}>
                        {content}
                      </Typography>
                      {filePath && (
                        <Typography variant="caption" color="text.secondary">
                          {filePath}
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Handle Test mode responses when success is False
  if (isTestMode && !isSuccess && data.response) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
        
        <Paper sx={{ p: 2, mb: 3, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Response
          </Typography>
          <Typography variant="body1" color="error.main">
            {data.response}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Default/legacy rendering for upload mode and other responses
  return (
    <Box>
      <Alert 
        severity={isSuccess ? 'success' : 'error'} 
        sx={{ mb: 2 }}
      >
        {message}
      </Alert>

      {Object.keys(data).length > 0 && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Data
          </Typography>
          <Typography variant="body1" component="pre" sx={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        </Paper>
      )}

      {fields && fields.length > 0 && (
        fields.map((field) => (
          <Paper
            key={field.id}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: isSuccess ? '#f5f5f5' : '#ffebee'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {field.label}
            </Typography>
            <Typography variant="body1">
              {response[field.id] || 'N/A'}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default ResponseDisplay; 