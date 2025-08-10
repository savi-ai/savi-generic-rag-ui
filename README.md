# RAG Experimentation Tool

A comprehensive React-based application for RAG (Retrieval-Augmented Generation) experimentation with advanced features including document upload, testing, evaluation, guardrails, and agentic AI capabilities.

## 🚀 Features


### **Upload Data Mode**
- **Document Source Selection**: Choose between file upload or S3 bucket
- **PDF Document Upload**: Drag & drop or file picker for multiple PDFs
- **S3 Integration**: Configure bucket name, region (us-east-1, us-west-2), and prefix
- **Vectorization Parameters**: Chunk size and overlap configuration for document processing
- **Use Case ID**: Specify unique identifier for uploaded documents

### **Test Mode**
- **Query Input**: Simple text area for single query testing
- **Use Case ID**: Specify which document set to query against
- **Search Parameters**: Top K (1-10), Temperature, Number of Tokens
- **System Prompt**: Custom AI behavior configuration
- **Tools Integration**: Selectable AI tools (VIN search, CARFAX, CIMS, Ihost)
- **Agentic Mode**: Enable AI agents (Self-Critic, ReAct) with API call capabilities
- **Guardrails**: Define rules to block specific questions and/or answers

### **Evaluation Mode**
- **Batch Testing**: Upload CSV files with query-answer pairs
- **Progress Tracking**: Real-time status updates with progress indicators
- **Results Download**: HTML report generation and download
- **Status Monitoring**: Check evaluation progress via API

## 🏗️ Architecture

### **Frontend Structure**
- **React 18**: Modern functional components with hooks
- **Material-UI 5**: Professional component library
- **React Router**: Client-side routing and navigation
- **State Management**: Local component state with React hooks

### **Backend Integration**
- **Upload API**: `localhost:8000/savi-rag-api/api/upload`
- **Test API**: `localhost:8000/savi-rag-api/api/test`
- **Evaluation API**: `localhost:8000/savi-rag-api/api/evaluate`
- **Status API**: Real-time evaluation progress monitoring

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access the Application**:
   - Upload Data: `http://localhost:3000/developer/upload`
   - Test: `http://localhost:3000/developer/test`


## 🔧 Usage Guide

### **Upload Data Mode**

1. **Select Document Source**:
   - **Upload Files**: Choose PDF documents from your device
   - **S3 Bucket**: Provide bucket details (name, region, prefix)

2. **Configure Vectorization** (if Vector is selected):
   - **Chunk Size**: Document chunk size for processing
   - **Overlap**: Overlap between consecutive chunks

3. **Enter Use Case ID**: Unique identifier for your document set

4. **Submit**: Documents are processed and indexed for future queries

### **Test Mode**

1. **Configure Search Parameters**:
   - **Top K**: Number of search results (1-10)
   - **Temperature**: Response randomness (0.0-2.0)
   - **Number of Tokens**: Maximum response length

2. **Set System Prompt**: Define AI behavior and context

3. **Configure Agentic Mode** (Optional):
   - **Self-Critic**: AI self-evaluation capability
   - **ReAct**: Reasoning and action framework
   - **API Call Tool**: Custom API integration

4. **Set Guardrails** (Optional):
   - **Question Guardrails**: Block specific types of questions
   - **Answer Guardrails**: Block specific types of responses

5. **Enter Query**: Single question or instruction

6. **Submit**: Get AI response with search results

### **Evaluation Mode**

1. **Upload CSV File**: File with columns `query` and `answer`
2. **Configure Parameters**: Same as Test mode
3. **Submit**: Batch evaluation starts
4. **Monitor Progress**: Check status and download results


## 🎨 UI Components

### **Navigation**
- **Title**: "RAG Experimentation Tool"
- **Tabs**: Upload Data and Test modes
- **Responsive Design**: Works on all device sizes

### **Response Display**
- **Success Responses**: Clean, structured display with search results
- **Error Handling**: User-friendly error messages
- **Evaluation Progress**: Real-time status updates with progress bars
- **Interactive Elements**: Expandable search results, status checking

### **Form Validation**
- **Required Fields**: Visual indicators and validation
- **Input Constraints**: Numeric ranges, file type validation
- **Conditional Logic**: Fields appear/disappear based on selections

## 📁 Project Structure

```
src/
├── components/
│   ├── DeveloperPage.js          # Main application logic
│   ├── ResponseDisplay.js        # Response rendering
│   ├── Navigation.js            # Top navigation bar
│   ├── ConfirmationDialog.js    # Confirmation dialogs
├── config/
│   └── generic-formConfig.json  # Form configuration
├── App.js                       # Main application component
└── index.js                     # Application entry point
```

## 🛠️ Development

### **Available Scripts**
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### **Dependencies**
- **React**: 18.2.0
- **Material-UI**: 5.15.10
- **React Router DOM**: 6.22.1
- **@mui/icons-material**: Latest

## 🔍 Troubleshooting

### **Common Issues**
1. **API Connection**: Ensure backend server is running on `localhost:8000`
2. **File Upload**: Check file size and PDF format
3. **S3 Configuration**: Verify bucket permissions and region settings
4. **CORS Issues**: Configure backend to allow frontend requests

### **Debug Mode**
- Enable browser developer tools
- Check Network tab for API calls
- Monitor Console for errors
- Use React DevTools for component state

## 📚 Examples

### **Sample CSV for Evaluation**
```csv
query,answer
"What is NVIDIA's revenue for 2025?","NVIDIA reported revenue of $60.9 billion for fiscal year 2025"
"What are the key growth drivers?","Data center growth, AI acceleration, and gaming demand"
```

### **Guardrail Examples**
- **Question Guardrails**: "Do not answer questions about financial advice"
- **Answer Guardrails**: "Do not provide personal information or medical diagnoses"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for RAG experimentation and AI research**
