import React, { useState } from 'react';
import { Container, Grid, Paper, Typography, Box, FormControlLabel, Checkbox, TextField, Button, CircularProgress, Radio, RadioGroup, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Storage as StorageIcon, Build as BuildIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import ResponseDisplay from './ResponseDisplay';
import formConfig from '../config/generic-formConfig.json';

function DeveloperPage() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVector, setIsVector] = useState(false);
  const [topK, setTopK] = useState(5);
  const [chunkSize, setChunkSize] = useState(1000);
  const [overlap, setOverlap] = useState(200);
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
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('test'); // 'test' or 'evaluation'
  const [evaluationData, setEvaluationData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  // Available tools
  const availableTools = [
    { id: 'vin_search', name: 'VIN Search', description: 'Use the VINteligence API to search vehicle information' },
    { id: 'carfax', name: 'CARFAX', description: 'Find the Date of First Use (DOFU) from CARFAX database' },
    { id: 'cims', name: 'CIMS', description: 'Access Claims database API for vehicle claims information' },
    { id: 'ihost', name: 'Ihost', description: 'Access Contract data APIs for vehicle contract information' }
  ];

  // Available agents
  const availableAgents = [
    { id: 'self_critic', name: 'Self Critic', description: 'Enable self-criticism to improve response quality and accuracy' },
    { id: 'fact_checker', name: 'Fact Checker', description: 'Verify facts and cross-reference information with reliable sources' },
    { id: 'context_analyzer', name: 'Context Analyzer', description: 'Analyze context and maintain conversation coherence' },
    { id: 'reasoning_agent', name: 'Reasoning Agent', description: 'Apply logical reasoning and step-by-step problem solving' },
    { id: 'summarization_agent', name: 'Summarization Agent', description: 'Create concise summaries of complex information' },
    { id: 'query_optimizer', name: 'Query Optimizer', description: 'Optimize search queries for better retrieval results' }
  ];

  const handleToolToggle = (toolId) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        if (!headers.includes('query') || !headers.includes('answer')) {
          alert('CSV must contain "query" and "answer" columns');
          setCsvFile(null);
          return;
        }
        
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            query: values[headers.indexOf('query')] || '',
            answer: values[headers.indexOf('answer')] || ''
          };
        });
        
        setEvaluationData(data);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  const removeCsvFile = () => {
    setCsvFile(null);
    setEvaluationData([]);
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

  const handleSubmit = async () => {
    if (mode === 'test' && !query.trim()) {
      alert('Please enter a query');
      return;
    }

    if (mode === 'evaluation' && evaluationData.length === 0) {
      alert('Please upload a CSV file with test data');
      return;
    }

    try {
      setIsLoading(true);
      setResponse(null);

      // Create llmParameters object
      const llmParameters = {
        isVector,
        topK: isVector ? topK : undefined,
        chunkSize: isVector ? chunkSize : undefined,
        overlap: isVector ? overlap : undefined,
        temperature: parseFloat(temperature),
        maxTokens: parseInt(maxTokens),
        useSelfCritic: selectedAgents.includes('self_critic')
      };

      // Create FormData for file upload or S3 configuration
      const formDataToSend = new FormData();
      
      // Add mode
      formDataToSend.append('mode', mode);
      
      if (mode === 'test') {
        // Add query for test mode
        formDataToSend.append('query', query);
      } else {
        // Add evaluation data for evaluation mode
        formDataToSend.append('evaluationData', JSON.stringify(evaluationData));
        if (csvFile) {
          formDataToSend.append('csvFile', csvFile);
        }
      }
      
      // Add llmParameters as JSON string
      formDataToSend.append('llmParameters', JSON.stringify(llmParameters));
      
      // Add selected tools as JSON string
      formDataToSend.append('tools', JSON.stringify(selectedTools));
      
      // Add selected agents as JSON string
      formDataToSend.append('agents', JSON.stringify(selectedAgents));
      
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
      
      {/* Search Parameters and Document Source - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
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
            {isVector && (
              <TextField
                label="Chunk Size"
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
                fullWidth
                margin="normal"
                inputProps={{ min: 1, max: 4000 }}
              />
            )}
            {isVector && (
              <TextField
                label="Overlap"
                type="number"
                value={overlap}
                onChange={(e) => setOverlap(parseInt(e.target.value) || 200)}
                fullWidth
                margin="normal"
                inputProps={{ min: 1, max: 1000 }}
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
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
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
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>AWS Region</InputLabel>
                  <Select
                    value={s3Config.region}
                    onChange={(e) => handleS3ConfigChange('region', e.target.value)}
                    label="AWS Region"
                  >
                    <MenuItem value="us-east-1">us-east-1</MenuItem>
                    <MenuItem value="us-west-2">us-west-2</MenuItem>
                  </Select>
                </FormControl>
                
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
        </Grid>
      </Grid>

      {/* Tools and Agents - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon />
              Tools
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the tools you want to enable for this request. Selected tools will be available to the AI model.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
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
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon />
              Agents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the AI agents you want to enable for this request. These agents will enhance the processing and response quality.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              {availableAgents.map((agent) => (
                <Box
                  key={agent.id}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: selectedAgents.includes(agent.id) ? '#fff3e0' : '#fafafa',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: selectedAgents.includes(agent.id) ? '#ffe0b2' : '#f5f5f5',
                      borderColor: '#ff9800'
                    }
                  }}
                  onClick={() => handleAgentToggle(agent.id)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => handleAgentToggle(agent.id)}
                        sx={{ mr: 1 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {agent.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {agent.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ margin: 0, width: '100%' }}
                  />
                </Box>
              ))}
            </Box>
            {selectedAgents.length > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                Selected agents: {selectedAgents.length}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Mode Selection and Query/CSV - Side by Side */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mode Selection
            </Typography>
            <RadioGroup
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="test"
                control={<Radio />}
                label="Test Mode - Single Query"
              />
              <FormControlLabel
                value="evaluation"
                control={<Radio />}
                label="Evaluation Mode - Batch Testing with CSV"
              />
            </RadioGroup>
            <Typography variant="body2" color="text.secondary">
              {mode === 'test' 
                ? 'Test mode allows you to submit a single query for testing.'
                : 'Evaluation mode allows you to upload a CSV file with multiple query-answer pairs for batch evaluation.'
              }
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {mode === 'test' ? 'Query' : 'Test Data Upload'}
            </Typography>
            
            {mode === 'test' ? (
              <Box>
                <TextField
                  label="Enter your query"
                  multiline
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Enter your question or query here..."
                  required
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload a CSV file with "query" and "answer" columns for batch evaluation.
                </Typography>
                
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={handleCsvUpload}
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload CSV File
                  </Button>
                </label>
                
                {csvFile && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded CSV File:
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {csvFile.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {evaluationData.length} test cases loaded
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={removeCsvFile}
                      >
                        Remove
                      </Button>
                    </Box>
                    
                    {evaluationData.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Preview (first 3 rows):
                        </Typography>
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                          {evaluationData.slice(0, 3).map((row, index) => (
                            <Box
                              key={index}
                              sx={{
                                p: 1,
                                mb: 1,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                backgroundColor: '#fafafa'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Query: {row.query}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Answer: {row.answer}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading || (mode === 'test' ? !query.trim() : evaluationData.length === 0)}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Submit'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Response - Full Width at Bottom */}
      <Paper sx={{ p: 3 }}>
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
    </Container>
  );
}

export default DeveloperPage; 