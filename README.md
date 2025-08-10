# RAG Experimentation Tool

A React-based dynamic form application for RAG (Retrieval-Augmented Generation) experimentation with configurable form fields, API endpoints, and response handling.

## Features

- **Dynamic Form Generation**: Form fields are driven by JSON configuration
- **Two-Column Layout**: Form on the left, response display on the right
- **Multiple Execution Modes**: Test and Evaluation modes for different use cases
- **Search Parameters**: Configurable LLM parameters (temperature, tokens, etc.)
- **System Prompt Support**: Custom system prompts for AI behavior control
- **Loading States**: Professional loading spinners during API calls
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access the Application**:
   - Test Page: `http://localhost:3000/`
   - Developer Page: `http://localhost:3000/developer`

## Configuration

The application uses `src/config/formConfig.json` to configure form fields, response fields, and API endpoints.

### API Endpoints Configuration

```json
{
  "apiEndpoint": "https://your-api.com/submit",
  "runEvaluationsApiEndpoint": "https://your-api.com/evaluate",
  "testApiEndpoint": "https://your-api.com/test"
}
```

- **apiEndpoint**: Default endpoint for form submissions
- **runEvaluationsApiEndpoint**: Endpoint for evaluation mode
- **testApiEndpoint**: Endpoint for test mode

### Form Fields Configuration

Form fields are defined in the `formFields` array. Each field supports the following properties:

```json
{
  "formFields": [
    {
      "id": "field_name",
      "label": "Display Label",
      "type": "text|email|number|select|textarea",
      "required": true|false,
      "placeholder": "Placeholder text",
      "options": ["option1", "option2"] // Only for select type
    }
  ]
}
```

#### Field Types

1. **text**: Single-line text input
   ```json
   {
     "id": "name",
     "label": "Full Name",
     "type": "text",
     "required": true,
     "placeholder": "Enter your full name"
   }
   ```

2. **email**: Email input with validation
   ```json
   {
     "id": "email",
     "label": "Email Address",
     "type": "email",
     "required": true,
     "placeholder": "Enter your email"
   }
   ```

3. **number**: Numeric input
   ```json
   {
     "id": "age",
     "label": "Age",
     "type": "number",
     "required": true,
     "placeholder": "Enter your age"
   }
   ```

4. **select**: Dropdown selection
   ```json
   {
     "id": "occupation",
     "label": "Occupation",
     "type": "select",
     "required": false,
     "options": ["Student", "Employed", "Self-employed", "Retired"]
   }
   ```

5. **textarea**: Multi-line text input
   ```json
   {
     "id": "message",
     "label": "Message",
     "type": "textarea",
     "required": false,
     "placeholder": "Enter your message"
   }
   ```

### Response Fields Configuration

Response fields define how API responses are displayed. Each field maps to a property in the API response:

```json
{
  "responseFields": [
    {
      "id": "status",
      "label": "Status",
      "type": "text"
    },
    {
      "id": "message",
      "label": "Response Message",
      "type": "text"
    },
    {
      "id": "timestamp",
      "label": "Timestamp",
      "type": "text"
    }
  ]
}
```

## Pages

### Test Page (`/`)
- Simple form with dynamic fields
- Basic API submission
- Clean, minimal interface
- Suitable for quick testing

### Developer Page (`/developer`)
- Advanced form with additional features:
  - **System Prompt**: Custom AI behavior configuration
  - **Search Parameters**: LLM configuration (temperature, tokens, etc.)
  - **Execution Modes**: Test and Evaluation options
  - **Form Variables**: Dynamic fields (hidden in evaluation mode)

## Search Parameters (Developer Page)

The Developer page includes configurable LLM parameters:

- **Full PDF/Vector**: Search type selection
- **Top K**: Number of results (when Vector is selected)
- **Temperature**: Response randomness (0.0-2.0)
- **Number of Tokens Generated**: Maximum response length (1-4000)
- **Use Self Critic**: Enable self-evaluation

## Execution Modes (Developer Page)

### Test Mode
- Shows all form variables
- Submits to `testApiEndpoint`
- Includes system prompt and form data
- Validates required fields

### Evaluation Mode
- Hides form variables
- Shows confirmation dialog
- Submits to `runEvaluationsApiEndpoint`
- Includes system prompt only
- Skips form validation

## API Request Structure

### Test Page Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "occupation": "Employed",
  "message": "Test message"
}
```

### Developer Page Request
```json
{
  "systemPrompt": "You are a helpful AI assistant...",
  "name": "John Doe",
  "email": "john@example.com",
  "llmParameters": {
    "isVector": true,
    "topK": 5,
    "temperature": 0.7,
    "maxTokens": 1000,
    "useSelfCritic": false
  }
}
```

## Customization

### Adding New Field Types
1. Update the `renderField` function in `DynamicForm.js` or `DeveloperForm.js`
2. Add the new field type to the switch statement
3. Update the configuration documentation

### Styling
The application uses Material-UI components. Customize the theme in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

### Adding New Pages
1. Create a new component in `src/components/`
2. Add a route in `src/App.js`
3. Add navigation link in `src/components/Navigation.js`

## Dependencies

- React 18.2.0
- Material-UI 5.15.10
- React Router DOM 6.22.1
- Axios 1.6.7

## Development

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Project Structure
```
src/
├── components/
│   ├── DynamicForm.js
│   ├── DeveloperForm.js
│   ├── ResponseDisplay.js
│   ├── ConfirmationDialog.js
│   ├── Navigation.js
│   └── DeveloperPage.js
├── config/
│   └── formConfig.json
├── App.js
└── index.js
```

## Troubleshooting

### Common Issues
1. **API Endpoint Not Found**: Check the endpoint URLs in `formConfig.json`
2. **Form Fields Not Loading**: Verify the JSON structure in the config file
3. **Validation Errors**: Ensure required fields are properly configured
4. **CORS Issues**: Configure your API server to allow requests from the frontend

### Debug Mode
Enable browser developer tools to see:
- Network requests and responses
- Console errors and warnings
- React component state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.