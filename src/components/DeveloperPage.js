import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, FormControlLabel, Checkbox, TextField, Button, CircularProgress, Radio, RadioGroup } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Storage as StorageIcon, Build as BuildIcon } from '@mui/icons-material';
import DeveloperForm from './DeveloperForm';
import ResponseDisplay from './ResponseDisplay';
import formConfig from '../config/generic-formConfig.json';

function DeveloperPage() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVector, setIsVector] = useState(false);
  const [topK, setTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [useSelfCritic, setUseSelfCritic] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentSource, setDocumentSource] = useState('upload'); // 'upload' or 's3'
  const [s3Config, setS3Config] = useState({
    bucketName: '',
    region: '',
    prefix: ''
  });
  const [selectedTools, setSelectedTools] = useState([]);

  // Available tools
  const availableTools = [
    { id: 'vin_search', name: 'VIN Search', description: 'Use the VINteligence API to search vehicle information' },
    { id: 'carfax', name: 'CARFAX', description: 'Find the Date of First Use (DOFU) from CARFAX database' },
    { id: 'cims', name: 'CIMS', description: 'Access Claims database API for vehicle claims information' },
    { id: 'ihost', name: 'Ihost', description: 'Access Contract data APIs for vehicle contract information' }
  ];

  const handleToolToggle = (toolId) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setUploadedFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleS3ConfigChange = (field, value) => {
    setS3Config(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (formData, mode = 'test') => {
    try {
      setIsLoading(true);
      setResponse(null);

      // Create llmParameters object
      const llmParameters = {
        isVector,
        topK: isVector ? topK : undefined,
        temperature: parseFloat(temperature),
        maxTokens: parseInt(maxTokens),
        useSelfCritic
      };

      // Create FormData for file upload or S3 configuration
      const formDataToSend = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add llmParameters as JSON string
      formDataToSend.append('llmParameters', JSON.stringify(llmParameters));
      
      // Add selected tools as JSON string
      formDataToSend.append('tools', JSON.stringify(selectedTools));
      
      // Add document source configuration
      if (documentSource === 'upload') {
        // Add uploaded files
        uploadedFiles.forEach((file, index) => {
          formDataToSend.append('attachments', file);
        });
        formDataToSend.append('documentSource', 'upload');
      } else {
        // Add S3 configuration
        formDataToSend.append('documentSource', 's3');
        formDataToSend.append('s3Config', JSON.stringify(s3Config));
      }

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
        body: formDataToSend,
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

          {/* Tools Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon />
              Tools
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the tools you want to enable for this request. Selected tools will be available to the AI model.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              {availableTools.map((tool) => (
                <Box
                  key={tool.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: selectedTools.includes(tool.id) ? '#f0f8ff' : '#fafafa',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedTools.includes(tool.id) ? '#e6f3ff' : '#f5f5f5',
                      borderColor: '#1976d2'
                    }
                  }}
                  onClick={() => handleToolToggle(tool.id)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTools.includes(tool.id)}
                        onChange={() => handleToolToggle(tool.id)}
                        sx={{ mr: 1 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {tool.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tool.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ margin: 0, width: '100%' }}
                  />
                </Box>
              ))}
            </Box>
            {selectedTools.length > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                Selected tools: {selectedTools.length}
              </Typography>
            )}
          </Paper>

          {/* Document Source Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Source
            </Typography>
            
            <RadioGroup
              value={documentSource}
              onChange={(e) => setDocumentSource(e.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="upload"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloudUploadIcon />
                    Upload PDF Documents
                  </Box>
                }
              />
              <FormControlLabel
                value="s3"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageIcon />
                    Use Documents from S3
                  </Box>
                }
              />
            </RadioGroup>

            {documentSource === 'upload' && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept=".pdf"
                    style={{ display: 'none' }}
                    id="pdf-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="pdf-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Upload PDF Documents
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload PDF documents to be processed. Multiple files can be selected.
                  </Typography>
                </Box>
                
                {/* Display uploaded files */}
                {uploadedFiles.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Files ({uploadedFiles.length}):
                    </Typography>
                    {uploadedFiles.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          backgroundColor: '#f5f5f5'
                        }}
                      >
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {documentSource === 's3' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configure S3 bucket details to access documents stored in AWS S3.
                </Typography>
                
                <TextField
                  label="S3 Bucket Name"
                  value={s3Config.bucketName}
                  onChange={(e) => handleS3ConfigChange('bucketName', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="my-documents-bucket"
                />
                
                <TextField
                  label="AWS Region"
                  value={s3Config.region}
                  onChange={(e) => handleS3ConfigChange('region', e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="us-east-1"
                />
                
                <TextField
                  label="S3 Prefix (Optional)"
                  value={s3Config.prefix}
                  onChange={(e) => handleS3ConfigChange('prefix', e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="documents/pdf/"
                  helperText="Optional prefix to filter documents in the bucket"
                />
              </Box>
            )}
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

export default DeveloperPage; 