# Codebase Guide

This document provides a detailed explanation of the project structure, key modules, and their responsibilities.

## 📁 Project Structure Overview

```
chatbot/
├── public/                    # Static public assets
│   ├── index.html            # HTML entry point
│   ├── manifest.json         # PWA manifest
│   ├── favicon.ico           # Browser favicon
│   ├── logo192.png           # App icon (192x192)
│   └── logo512.png           # App icon (512x512)
├── src/                       # Application source code
│   ├── components/           # React components
│   │   ├── Header.js         # Header component
│   │   ├── Header.css        # Header styles
│   │   ├── Message.js        # Main chat component
│   │   └── Message.css       # Chat styles
│   ├── App.js                # Root component
│   ├── App.css               # Root styles
│   ├── App.test.js           # Component tests
│   ├── index.js              # Application entry point
│   ├── index.css             # Global styles
│   └── setupTests.js         # Test configuration
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project metadata and dependencies
├── README.md                 # Project overview
├── ARCHITECTURE.md           # System architecture
├── CONTRIBUTING.md           # Contribution guidelines
├── CHANGELOG.md              # Version history
└── CODEBASE_GUIDE.md         # This file
```

## 🔍 Detailed Directory Breakdown

### `/public` - Static Assets

This directory contains static files that are served directly and not processed by Webpack.

| File | Purpose |
|------|---------|
| `index.html` | Main HTML template with root div for React mounting |
| `manifest.json` | PWA manifest for installability and metadata |
| `favicon.ico` | Browser tab icon |
| `logo192.png` | App icon for mobile devices (192x192px) |
| `logo512.png` | App icon for mobile devices (512x512px) |

**Key Points:**
- Files here are copied as-is to the build output
- Use `%PUBLIC_URL%` to reference these files in HTML
- Cannot use JavaScript imports from here

### `/src` - Source Code

The main application code lives here. This is processed by Create React App's build system.

#### `/src/components` - React Components

Reusable UI components, each with their own CSS file.

##### `Header.js` / `Header.css`

**Purpose**: Displays the application header/title bar.

**Responsibilities:**
- Shows the chatbot branding ("MY CHAT BOT")
- Provides visual separation from the chat area
- Responsive font sizing

**Key Features:**
- Sky blue background (#87ceeb)
- Flexbox centering
- Responsive font size (2rem → 1.5rem on mobile)

##### `Message.js` / `Message.css`

**Purpose**: The core chat interface component.

**Responsibilities:**
- Manages all chat-related state
- Handles user input and message sending
- Communicates with the backend API
- Displays chat history with proper styling
- Shows loading and error states
- Auto-scrolls to latest messages

**State Structure:**
```javascript
{
  chat: [],           // Array of message objects
  msg: '',            // Current input value
  isLoading: false,   // API request in progress
  error: null         // Error message if any
}
```

**Message Object Structure:**
```javascript
{
  from: 'user' | 'bot',  // Message sender
  msg: 'message text'     // Message content
}
```

**Key Methods:**
- `handleChange(e)`: Updates input state on typing
- `handleSend()`: Sends message to API and updates chat
- `handleKeyPress(e)`: Handles Enter key submission

**Key Features:**
- Async/await API calls with axios
- Immutable state updates
- Auto-scroll via useEffect
- Error handling with dismissible banner
- Loading indicator
- Keyboard support (Enter to send)
- Responsive design with breakpoints

#### `App.js` / `App.css`

**Purpose**: Root component that composes the application.

**Responsibilities:**
- Renders the main layout
- Composes Header and Message components
- Provides root styling container

**Structure:**
```javascript
function App() {
  return (
    <div className="App">
      <Header />
      <Message />
    </div>
  );
}
```

#### `index.js`

**Purpose**: Application entry point.

**Responsibilities:**
- Mounts the React app to the DOM
- Uses React 18's `createRoot` API
- Wraps app in `React.StrictMode`

**Key Code:**
```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `index.css`

**Purpose**: Global styles applied to the entire application.

**Contents:**
- CSS reset (box-sizing)
- Body styles (margin, font-family, background)
- Scrollbar styling
- Code font styling

**Key Features:**
- Modern gradient background
- Custom scrollbar design
- System font stack

#### `App.test.js`

**Purpose**: Component tests using React Testing Library.

**Test Cases:**
- Renders chatbot header
- Renders message input field
- Renders send button

#### `setupTests.js`

**Purpose**: Test environment configuration.

**Contents:**
- Imports `@testing-library/jest-dom` for extended matchers

### Root Configuration Files

#### `package.json`

**Purpose**: Project metadata and dependency management.

**Key Scripts:**
- `npm start`: Start development server
- `npm run build`: Create production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App

**Key Dependencies:**
- `react`, `react-dom`: React library
- `axios`: HTTP client
- `react-scripts`: Build tooling

#### `.env.example`

**Purpose**: Template for environment variables.

**Variables:**
- `REACT_APP_API_URL`: Backend API URL

#### `.gitignore`

**Purpose**: Files and directories to exclude from version control.

**Ignored Patterns:**
- `node_modules/`: Dependencies
- `build/`: Production build output
- `.env`: Environment variables
- IDE files (`.idea/`, `.vscode/`)
- OS files (`.DS_Store`)

#### `public/manifest.json`

**Purpose**: PWA manifest for installability.

**Key Properties:**
- `name`: Full app name
- `short_name`: Home screen name
- `theme_color`: Browser UI color
- `display`: Standalone mode

## 🏗️ Architecture Patterns

### Component Communication

```
App (Parent)
├── Header (Child - Presentational)
└── Message (Child - Container/Smart)
    └── Manages its own state
    └── Calls external API
```

### State Management Pattern

The application uses **local component state** with React Hooks:

1. **useState**: For managing component state
2. **useRef**: For DOM references (chat container)
3. **useEffect**: For side effects (auto-scroll)

### API Integration Pattern

```javascript
// 1. Configuration
const API_URL = process.env.REACT_APP_API_URL;

// 2. Async call with error handling
try {
  const response = await axios.post(`${API_URL}/user`, { msg });
  // 3. Update state on success
  setChat(prev => [...prev, newUserMsg, newBotMsg]);
} catch (err) {
  // 4. Handle errors gracefully
  setError('Error message');
}
```

## 🎨 Styling Approach

### CSS Organization

1. **Global Styles** (`index.css`): Applied to entire app
2. **Component Styles**: Each component has its own CSS file
3. **No CSS-in-JS**: Plain CSS files for simplicity

### Naming Conventions

- **Class names**: kebab-case (`.message-container`, `.send-button`)
- **CSS files**: Same name as component (`Header.css` for `Header.js`)
- **Modifiers**: Double hyphen (`.message--bot`, `.message--user`)

### Responsive Design

```css
/* Mobile-first approach */
.element { /* Base styles for mobile */ }

@media (min-width: 480px) { /* Tablet */ }

@media (min-width: 768px) { /* Desktop */ }
```

## 🔄 Data Flow

### User Sends Message Flow

```
1. User types in input
   └── handleChange() → setMsg(value)

2. User clicks Send or presses Enter
   └── handleSend() called

3. Validate input
   └── if (!msg.trim()) return

4. Set loading state
   └── setIsLoading(true)

5. Clear input
   └── setMsg('')

6. Call API
   └── axios.post(`${API_URL}/user`, { msg })

7. On success
   └── setChat(prev => [...prev, userMsg, botMsg])

8. On error
   └── setError('Error message')

9. Clear loading
   └── setIsLoading(false)

10. Auto-scroll triggered
    └── useEffect → scrollTop = scrollHeight
```

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server (http://localhost:3000) |
| `npm test` | Run tests in watch mode |
| `npm run build` | Create optimized production build |
| `npm run eject` | Eject from CRA (one-way operation) |

## 📦 Build Output

After running `npm run build`:

```
build/
├── static/
│   ├── js/           # JavaScript bundles
│   ├── css/          # CSS bundles
│   └── media/        # Images and fonts
├── index.html        # Main HTML file
├── manifest.json     # PWA manifest
├── favicon.ico       # Favicon
└── ...other assets
```

## 🔒 Environment Variables

React apps expose environment variables prefixed with `REACT_APP_`:

```bash
# .env file
REACT_APP_API_URL=http://localhost:5050
```

Access in code:
```javascript
const url = process.env.REACT_APP_API_URL;
```

## 🧪 Testing

Tests are located alongside source files with `.test.js` extension.

**Testing Library Used:** React Testing Library

**Test Commands:**
```bash
npm test              # Watch mode
npm test -- --coverage  # With coverage
CI=true npm test    # Single run (for CI)
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Static Hosting**: Upload `build/` folder to any static host
2. **Vercel**: Connect GitHub repo for automatic deployments
3. **GitHub Pages**: Use `gh-pages` package
4. **Docker**: Containerize with Node.js image

### Environment Configuration

Set environment variables during build:

```bash
REACT_APP_API_URL=https://api.production.com npm run build
```

## 📝 Key Takeaways

1. **Simple Architecture**: Single Message component handles all chat logic
2. **Modern React**: Functional components with hooks
3. **Responsive Design**: Mobile-first CSS approach
4. **Error Handling**: User-friendly error messages
5. **Accessibility**: ARIA labels and semantic HTML
6. **Environment Config**: API URL configurable via .env
7. **Well Documented**: Comprehensive documentation files
8. **Test Coverage**: Basic component tests included