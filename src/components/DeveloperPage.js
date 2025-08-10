import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Radio, 
  RadioGroup, 
  CircularProgress,
  Alert
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import DynamicForm from './DynamicForm';
import ResponseDisplay from './ResponseDisplay';
import ConfirmationDialog from './ConfirmationDialog';
import formConfig from '../config/generic-formConfig.json';

function DeveloperPage() {
  const location = useLocation();
  const isUploadMode = location.pathname === '/developer/upload';
  
  // State variables
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload mode states
  const [isVector, setIsVector] = useState(false);
  const [chunkSize, setChunkSize] = useState('1000');
  const [overlap, setOverlap] = useState('200');
  const [usecaseId, setUsecaseId] = useState('');
  const [documentSource, setDocumentSource] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [s3Config, setS3Config] = useState({
    bucketName: '',
    region: 'us-east-1'
  });

  // Test mode states
  const [topK, setTopK] = useState('5');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('1000');
  const [useSelfCritic, setUseSelfCritic] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState([]);
  const [isAgentic, setIsAgentic] = useState(false);
  const [selectedAgenticType, setSelectedAgenticType] = useState('');
  const [isApiCallEnabled, setIsApiCallEnabled] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    url: '',
    method: 'GET',
    body: '',
    headers: ''
  });
  const [useGuardrail, setUseGuardrail] = useState(false);
  const [questionGuardrails, setQuestionGuardrails] = useState('');
  const [answerGuardrails, setAnswerGuardrails] = useState('');
  const [subMode, setSubMode] = useState('test');
  const [query, setQuery] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [evaluationData, setEvaluationData] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Available tools and agentic types
  const tools = [
    { id: 'vin_search', name: 'VIN Search' },
    { id: 'carfax', name: 'CARFAX' },
    { id: 'cims', name: 'CIMS' },
    { id: 'ihost', name: 'Ihost' }
  ];

  const agenticTypes = [
    { id: 'self_critic', name: 'Self Critic' },
    { id: 'react', name: 'ReAct' }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // Filter for PDF files only
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      alert('Only PDF files are allowed. Please select PDF files only.');
    }
    setUploadedFiles([...uploadedFiles, ...pdfFiles]);
  };

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          return {
            query: values[0]?.trim() || '',
            answer: values[1]?.trim() || ''
          };
        });
        setEvaluationData(data);
      };
      reader.readAsText(file);
    }
  };

  const removeCsvFile = () => {
    setCsvFile(null);
    setEvaluationData([]);
  };

  const handleSubmit = async () => {
    // Validation for Upload mode
    if (isUploadMode) {
      if (!usecaseId.trim()) {
        alert('Please enter a Use Case ID');
        return;
      }
      if (documentSource === 'upload' && uploadedFiles.length === 0) {
        alert('Please upload at least one PDF file');
        return;
      }
      if (documentSource === 's3' && !s3Config.bucketName.trim()) {
        alert('Please enter S3 bucket name');
        return;
      }
    }

    // Validation for Test mode
    if (!isUploadMode) {
      if (!usecaseId.trim()) {
        alert('Please enter a Use Case ID');
        return;
      }
      const topKInt = parseInt(topK);
      if (Number.isNaN(topKInt) || topKInt < 1 || topKInt > 10) {
        alert('Top K must be an integer between 1 and 10');
        return;
      }
      if (subMode === 'test' && !query.trim()) {
        alert('Please enter a query');
        return;
      }
      if (subMode === 'evaluation' && evaluationData.length === 0) {
        alert('Please upload a CSV file with test data');
        return;
      }
      if (isAgentic && !selectedAgenticType) {
        alert('Please select an Agentic type when Agentic mode is enabled');
        return;
      }
      if (isAgentic && isApiCallEnabled && apiConfig.url.trim() === '') {
        alert('Please enter API URL when API call is enabled');
        return;
      }
      if (useGuardrail && (questionGuardrails.trim() === '' && answerGuardrails.trim() === '')) {
        alert('Please enter at least one of Question or Answer guardrail rules when guardrails are enabled');
        return;
      }
    }

    try {
      setIsLoading(true);
      setResponse(null);

      const formDataToSend = new FormData();
      formDataToSend.append('mainMode', isUploadMode ? 'upload' : 'run');

      if (isUploadMode) {
        // Upload mode - match backend API specification
        formDataToSend.append('usecase_id', usecaseId);
        
        // Create llm_parameters object
        const llmParameters = { 
          isVector, 
          chunkSize: isVector ? parseInt(chunkSize) : undefined, 
          overlap: isVector ? parseInt(overlap) : undefined 
        };
        formDataToSend.append('llm_parameters', JSON.stringify(llmParameters));
        
        if (documentSource === 'upload') {
          // Add files as array
          uploadedFiles.forEach((file, index) => {
            formDataToSend.append('files', file);
          });
        } else {
          // Add s3_config as JSON string
          formDataToSend.append('s3_config', JSON.stringify(s3Config));
        }
        
        const endpoint = 'http://localhost:8000/savi-rag-api/api/upload';
        try {
          const response = await fetch(endpoint, { 
            method: 'POST', 
            body: formDataToSend,
            // Don't set Content-Type header for FormData - browser will set it automatically with boundary
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
          
          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            throw new Error(`Invalid JSON response from server: ${jsonError.message}`);
          }
          
          setResponse(data);
        } catch (error) {
          console.error('Upload error:', error);
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            setResponse({ 
              success: false, 
              message: 'Network error: Unable to connect to the backend server. Please ensure the server is running on localhost:8000.',
              data: {},
              timestamp: new Date().toISOString()
            });
          } else {
            setResponse({ 
              success: false, 
              message: `Upload failed: ${error.message}`,
              data: {},
              timestamp: new Date().toISOString()
            });
          }
        }
      } else {
        // Test mode - send query/evaluation data
        if (subMode === 'test') {
          // Test mode - match backend API specification
          formDataToSend.append('usecase_id', usecaseId);
          formDataToSend.append('query', query);
          
          // Create llm_parameters object
          const computedTopK = Math.min(10, Math.max(1, parseInt(topK) || 5));
          const llmParameters = { 
            topK: computedTopK, 
            temperature: parseFloat(temperature), 
            maxTokens: parseInt(maxTokens), 
            useSelfCritic: isAgentic && selectedAgenticType === 'self_critic'
          };
          formDataToSend.append('llm_parameters', JSON.stringify(llmParameters));
          formDataToSend.append('system_prompt', systemPrompt);
          
          // Add tools - include API call if selected in Agentic mode
          const toolsToSend = [];
          if (isAgentic && isApiCallEnabled) {
            toolsToSend.push('api_call');
          }
          formDataToSend.append('tools', JSON.stringify(toolsToSend));
          
          // Add Agentic configuration
          formDataToSend.append('agentic_config', JSON.stringify({
            enabled: isAgentic,
            type: isAgentic ? selectedAgenticType : undefined,
            useApiCall: isAgentic && isApiCallEnabled,
            apiConfig: isAgentic && isApiCallEnabled ? apiConfig : null
          }));

          // Add Guardrail configuration (independent of Agentic)
          formDataToSend.append('guardrail_config', JSON.stringify({
            useGuardrails: useGuardrail,
            questionGuardrails: useGuardrail ? questionGuardrails : null,
            answerGuardrails: useGuardrail ? answerGuardrails : null
          }));
          
          const endpoint = 'http://localhost:8000/savi-rag-api/api/test';
          try {
            const response = await fetch(endpoint, { 
              method: 'POST', 
              body: formDataToSend 
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              throw new Error(`Invalid JSON response from server: ${jsonError.message}`);
            }
            
            setResponse(data);
          } catch (error) {
            console.error('Test error:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
              setResponse({ 
                success: false, 
                message: 'Network error: Unable to connect to the backend server. Please ensure the server is running on localhost:8000.',
                data: {},
                timestamp: new Date().toISOString()
              });
            } else {
              setResponse({ 
                success: false, 
                message: `Test failed: ${error.message}`,
                data: {},
                timestamp: new Date().toISOString()
              });
            }
          }
        } else {
          // Evaluation mode - send evaluation data
          formDataToSend.append('usecase_id', usecaseId);
          formDataToSend.append('evaluation_data', JSON.stringify(evaluationData));
          
          // Create llm_parameters object
          const computedTopKEval = Math.min(10, Math.max(1, parseInt(topK) || 5));
          const llmParameters = { 
            topK: computedTopKEval, 
            temperature: parseFloat(temperature), 
            maxTokens: parseInt(maxTokens), 
            useSelfCritic: isAgentic && selectedAgenticType === 'self_critic'
          };
          formDataToSend.append('llm_parameters', JSON.stringify(llmParameters));
          formDataToSend.append('system_prompt', systemPrompt);
          
          // Add tools - include API call if selected in Agentic mode
          const toolsToSend = [];
          if (isAgentic && isApiCallEnabled) {
            toolsToSend.push('api_call');
          }
          formDataToSend.append('tools', JSON.stringify(toolsToSend));
          
          // Add Agentic configuration
          formDataToSend.append('agentic_config', JSON.stringify({
            enabled: isAgentic,
            type: isAgentic ? selectedAgenticType : undefined,
            useApiCall: isAgentic && isApiCallEnabled,
            apiConfig: isAgentic && isApiCallEnabled ? apiConfig : null
          }));

          // Add Guardrail configuration (independent of Agentic)
          formDataToSend.append('guardrail_config', JSON.stringify({
            useGuardrails: useGuardrail,
            questionGuardrails: useGuardrail ? questionGuardrails : null,
            answerGuardrails: useGuardrail ? answerGuardrails : null
          }));
          
          const endpoint = 'http://localhost:8000/savi-rag-api/api/evaluate';
          try {
            const response = await fetch(endpoint, { 
              method: 'POST', 
              body: formDataToSend 
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            let data;
            try {
              data = await response.json();
            } catch (jsonError) {
              throw new Error(`Invalid JSON response from server: ${jsonError.message}`);
            }
            
            setResponse(data);
          } catch (error) {
            console.error('Evaluation error:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
              setResponse({ 
                success: false, 
                message: 'Network error: Unable to connect to the backend server. Please ensure the server is running on localhost:8000.',
                data: {},
                timestamp: new Date().toISOString()
              });
            } else {
              setResponse({ 
                success: false, 
                message: `Evaluation failed: ${error.message}`,
                data: {},
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setResponse({ 
        success: false, 
        message: `An error occurred while processing your request: ${error.message}`,
        data: {},
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEvaluation = () => {
    setShowConfirmation(false);
    handleSubmit();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        {isUploadMode ? 'Upload Data' : 'Test'}
      </Typography>

      {/* Upload Data Content */}
      {isUploadMode && (
        <Box>
          {/* Vectorization Parameters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vectorization Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isVector}
                      onChange={(e) => setIsVector(e.target.checked)}
                    />
                  }
                  label="Vector"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!isVector}
                      onChange={(e) => setIsVector(!e.target.checked)}
                    />
                  }
                  label="Full PDF"
                />
              </Grid>
              {isVector && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Chunk Size"
                      type="number"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(e.target.value)}
                      fullWidth
                      helperText="Size of text chunks for vectorization"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Overlap"
                      type="number"
                      value={overlap}
                      onChange={(e) => setOverlap(e.target.value)}
                      fullWidth
                      helperText="Overlap between chunks"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Upload Documentation */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Documentation
            </Typography>
            
            <TextField
              label="Use Case ID"
              value={usecaseId}
              onChange={(e) => setUsecaseId(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter a unique identifier for this use case"
              helperText="This ID will be used to identify your documents"
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Document Source:
            </Typography>
            <RadioGroup
              value={documentSource}
              onChange={(e) => setDocumentSource(e.target.value)}
              row
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="upload"
                control={<Radio />}
                label="Upload Files"
              />
              <FormControlLabel
                value="s3"
                control={<Radio />}
                label="S3 Bucket"
              />
            </RadioGroup>

            {documentSource === 'upload' ? (
              <Box>
                <input
                  accept=".pdf"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload PDF Files
                  </Button>
                </label>
                
                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Uploaded Files:
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
                        <Typography variant="body2">{file.name}</Typography>
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
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="S3 Bucket Name"
                      value={s3Config.bucketName}
                      onChange={(e) => setS3Config({...s3Config, bucketName: e.target.value})}
                      fullWidth
                      margin="normal"
                      placeholder="Enter S3 bucket name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>AWS Region</InputLabel>
                      <Select
                        value={s3Config.region}
                        onChange={(e) => setS3Config({...s3Config, region: e.target.value})}
                        label="AWS Region"
                      >
                        <MenuItem value="us-east-1">us-east-1</MenuItem>
                        <MenuItem value="us-west-2">us-west-2</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Submit Button for Upload */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || !usecaseId.trim() || (documentSource === 'upload' ? uploadedFiles.length === 0 : !s3Config.bucketName.trim())}
              sx={{ minWidth: 200 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Upload Documents'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Test Content */}
      {!isUploadMode && (
        <Box>
          {/* Search Parameters */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Parameters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Top K"
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(e.target.value)}
                  fullWidth
                  inputProps={{ min: 1, max: 10, step: 1 }}
                  helperText="Number of top results to retrieve (1-10)"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Temperature"
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  helperText="Controls randomness (0.0 = deterministic, 2.0 = very random)"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Number of Tokens Generated"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  fullWidth
                  helperText="Maximum tokens to generate"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* System Prompt */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Prompt
            </Typography>
            <TextField
              label="System Prompt"
              multiline
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              fullWidth
              placeholder="Enter the system prompt that will guide the AI's behavior..."
              helperText="This prompt sets the context and behavior for the AI assistant"
            />
          </Paper>

          {/* Agentic Mode */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agentic Mode
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enable Agentic mode to use a custom agent for the query.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAgentic}
                  onChange={(e) => setIsAgentic(e.target.checked)}
                />
              }
              label="Enable Agentic Mode"
            />
            {isAgentic && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  Select Agentic Type:
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Agentic Type</InputLabel>
                  <Select
                    value={selectedAgenticType}
                    onChange={(e) => setSelectedAgenticType(e.target.value)}
                    label="Agentic Type"
                  >
                    {agenticTypes.map((agenticType) => (
                      <MenuItem key={agenticType.id} value={agenticType.id}>
                        {agenticType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
                  Select tools for the agent to use:
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isApiCallEnabled}
                      onChange={(e) => setIsApiCallEnabled(e.target.checked)}
                    />
                  }
                  label="API Call Tool - Allow agent to make external API calls"
                />
                
                {isApiCallEnabled && (
                  <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      API Call Tool Configuration:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="API URL"
                          value={apiConfig.url}
                          onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                          fullWidth
                          margin="normal"
                          placeholder="https://api.example.com/endpoint"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Method</InputLabel>
                          <Select
                            value={apiConfig.method}
                            onChange={(e) => setApiConfig({...apiConfig, method: e.target.value})}
                            label="Method"
                          >
                            <MenuItem value="GET">GET</MenuItem>
                            <MenuItem value="POST">POST</MenuItem>
                            <MenuItem value="PUT">PUT</MenuItem>
                            <MenuItem value="DELETE">DELETE</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    <TextField
                      label="Headers (JSON)"
                      multiline
                      rows={2}
                      value={apiConfig.headers}
                      onChange={(e) => setApiConfig({...apiConfig, headers: e.target.value})}
                      fullWidth
                      margin="normal"
                      placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                      helperText="Enter headers as JSON object"
                    />
                    
                    {(apiConfig.method === 'POST' || apiConfig.method === 'PUT') && (
                      <TextField
                        label="Body (JSON)"
                        multiline
                        rows={3}
                        value={apiConfig.body}
                        onChange={(e) => setApiConfig({...apiConfig, body: e.target.value})}
                        fullWidth
                        margin="normal"
                        placeholder='{"key": "value", "data": "example"}'
                        helperText="Enter request body as JSON object"
                      />
                    )}
                  </Box>
                )}
              </>
            )}
          </Paper>

          {/* Guardrails - available regardless of Agentic mode */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Guardrails
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define safety rules to block specific types of questions and/or answers. Applies to both Agentic and non-Agentic modes.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useGuardrail}
                  onChange={(e) => setUseGuardrail(e.target.checked)}
                />
              }
              label="Enable Guardrails"
            />
            {useGuardrail && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Question Guardrails"
                  multiline
                  rows={4}
                  value={questionGuardrails}
                  onChange={(e) => setQuestionGuardrails(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Enter the types of questions you want to block. For example:\n- Questions about personal information\n- Requests for illegal activities\n- Requests for medical advice without proper context"
                  helperText="Describe the types of questions you want to block"
                />
                <TextField
                  label="Answer Guardrails"
                  multiline
                  rows={4}
                  value={answerGuardrails}
                  onChange={(e) => setAnswerGuardrails(e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="Enter the types of answers you want to block. For example:\n- Answers containing sensitive data\n- Answers containing illegal content\n- Answers containing medical advice without proper context"
                  helperText="Describe the types of answers you want to block"
                />
              </Box>
            )}
          </Paper>

          {/* Query/CSV Upload Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {subMode === 'test' ? 'Query' : 'Test Data Upload'}
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Run Mode:
                </Typography>
                <RadioGroup
                  value={subMode}
                  onChange={(e) => setSubMode(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="test"
                    control={<Radio size="small" />}
                    label="Test"
                  />
                  <FormControlLabel
                    value="evaluation"
                    control={<Radio size="small" />}
                    label="Evaluation"
                  />
                </RadioGroup>
              </Box>
            </Box>
            
            {/* Use Case ID - Available for both Test and Evaluation */}
            <TextField
              label="Use Case ID"
              value={usecaseId}
              onChange={(e) => setUsecaseId(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Enter the use case ID for the documents you want to query"
              helperText="This ID should match the use case ID used when uploading documents"
              sx={{ mb: 3 }}
            />
            
            {subMode === 'test' ? (
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
                disabled={isLoading || !usecaseId.trim() || (subMode === 'test' ? !query.trim() : evaluationData.length === 0)}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Submit'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Response Display */}
      {response && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Response
          </Typography>
          <ResponseDisplay response={response} fields={formConfig?.responseFields || []} isTestMode={!isUploadMode} />
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmEvaluation}
        title="Confirm Evaluation Mode"
        message="You are about to run in evaluation mode. This will use the evaluation endpoint and may take longer to process. Are you sure you want to continue?"
      />
    </Container>
  );
}

export default DeveloperPage; 