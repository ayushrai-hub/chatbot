# Architecture Documentation

This document describes the system architecture, design decisions, and data flow of the ChatBot application.

## System Overview

The ChatBot application is a **single-page React application (SPA)** that serves as the frontend interface for an AI-powered chatbot system. It communicates with a separate backend API server via HTTP requests.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Application                         ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         ││
│  │  │   Header    │  │    App      │  │   Message   │         ││
│  │  │  Component  │  │  Component  │  │  Component  │         ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘         ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │                   State Management                   │   ││
│  │  │  • chat: Array of messages                           │   ││
│  │  │  • msg: Current input value                          │   ││
│  │  │  • isLoading: Loading state                          │   ││
│  │  │  • error: Error state                                │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  POST /user { msg: string } → { response: string }          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Component Hierarchy

```
App (Root)
├── Header
│   └── Header.css
└── Message
    ├── Message.css
    └── (Internal state management)
```

### Component Details

#### 1. App (src/App.js)

**Purpose**: Root component that orchestrates the application layout.

**Responsibilities**:
- Renders the main layout structure
- Composes Header and Message components
- Provides overall styling container

**Props**: None

**State**: None (presentational component)

#### 2. Header (src/components/Header.js)

**Purpose**: Displays the application header/title bar.

**Responsibilities**:
- Shows the chatbot branding
- Provides visual separation from chat area

**Props**: None

**State**: None (presentational component)

**Styles**: Header.css

#### 3. Message (src/components/Message.js)

**Purpose**: Core chat interface component handling all chat functionality.

**Responsibilities**:
- Manages chat message state
- Handles user input
- Communicates with backend API
- Displays chat history
- Shows loading and error states
- Auto-scrolls to latest messages

**Props**: None

**State**:
```javascript
{
  chat: [],           // Array of { from: 'user'|'bot', msg: string }
  msg: '',            // Current input value
  isLoading: false,   // Whether waiting for API response
  error: null         // Error message if API call fails
}
```

**Key Methods**:
- `handleChange(e)`: Updates input state
- `handleSend()`: Sends message to API
- `handleKeyPress(e)`: Handles Enter key submission

**Styles**: Message.css

## Data Flow

### Message Sending Flow

```
1. User types message in input field
        │
        ▼
2. handleChange() updates msg state
        │
        ▼
3. User clicks Send or presses Enter
        │
        ▼
4. handleSend() is called
        │
        ├──► Validate message (not empty)
        │
        ├──► Set isLoading = true
        │
        ├──► Clear input field (setMsg(''))
        │
        ├──► POST to API: { msg: userMessage }
        │
        ├──► On Success:
        │    ├── Add user message to chat
        │    ├── Add bot response to chat
        │    └── Set isLoading = false
        │
        └──► On Error:
             ├── Add user message to chat
             ├── Set error state
             └── Set isLoading = false
```

### Auto-Scroll Flow

```
1. chat state updates (new messages)
        │
        ▼
2. useEffect hook detects change
        │
        ▼
3. Scroll chat container to bottom
        │
        ▼
4. User sees latest messages
```

## State Management

### Local Component State

The application uses **React Hooks** for state management:

- **useState**: For managing component-level state
- **useRef**: For direct DOM access (chat container scrolling)
- **useEffect**: For side effects (auto-scroll on message updates)

### State Update Patterns

```javascript
// Immutable state updates (functional updates for derived state)
setChat(prevChat => [...prevChat, newMessage]);

// Direct state updates
setMsg(newValue);
setIsLoading(true);
setError(errorMessage);
```

## API Integration

### Configuration

The API URL is configured via environment variable:

```
REACT_APP_API_URL=http://localhost:5050
```

Default fallback: `http://localhost:5050`

### API Contract

**Endpoint**: `POST /user`

**Request**:
```json
{
  "msg": "Hello, how are you?"
}
```

**Response**:
```
"Hello! I'm doing well. How can I help you today?"
```

### Error Handling

The application handles various error scenarios:

1. **Network Errors**: Connection refused, timeout
2. **Server Errors**: 5xx responses
3. **Client Errors**: 4xx responses
4. **Empty Responses**: Graceful handling

Errors are displayed to the user via an error banner with a dismiss button.

## Styling Architecture

### CSS Organization

- **Global Styles** (src/index.css): Body, scrollbar, reset
- **App Styles** (src/App.css): Root container
- **Component Styles**: Each component has its own CSS file

### Design Decisions

1. **Responsive Design**: Mobile-first approach with media queries
2. **CSS Variables**: Not used (simple color scheme)
3. **Flexbox**: Used for layout (message alignment, input area)
4. **Animations**: CSS keyframes for message appearance
5. **Color Scheme**:
   - Bot messages: Dark blue (#2c3e50)
   - User messages: Orange (#ff8c00)
   - Background: Purple gradient
   - Header: Sky blue (#87ceeb)

### Responsive Breakpoints

- **Desktop**: Default (> 768px)
- **Tablet**: ≤ 768px
- **Mobile**: ≤ 480px

## Performance Considerations

1. **Virtual Scrolling**: Not implemented (suitable for moderate chat history)
2. **Message Pagination**: Not implemented (loads all messages)
3. **Image Optimization**: Background uses CSS gradient (no images)
4. **Bundle Size**: Minimal dependencies (React, ReactDOM, Axios)
5. **Memoization**: Not used (simple component tree)

## Security Considerations

1. **Input Sanitization**: React automatically escapes JSX content
2. **XSS Prevention**: No dangerouslySetInnerHTML usage
3. **API Security**: CORS handled by backend
4. **Environment Variables**: API URL configurable, not hardcoded
5. **Error Messages**: Generic error messages (no sensitive info leaked)

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Minimum supported: Browsers supporting ES6+ and React 18

## Future Architecture Improvements

1. **Context API**: For global state management if app grows
2. **Custom Hooks**: Extract chat logic into reusable hook
3. **WebSocket**: For real-time bidirectional communication
4. **Message Persistence**: LocalStorage for offline support
5. **TypeScript**: For type safety
6. **Component Library**: For consistent UI components
7. **Testing Library**: More comprehensive test coverage