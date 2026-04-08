# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-04-07

### Added

- **API_DOCS.md** — HTTP reference for `/health`, `/doctors`, `/availability`, `/book-appointment`, and `POST /user` (payloads, status codes, session behavior).

### Changed

- **ARCHITECTURE.md** — Rewritten for the current stack (doctor appointment chatbot, sql.js, Express, Docker/nginx), replacing outdated “AI echo” and legacy file paths.
- **CODEBASE_GUIDE.md** — Aligned with actual `src/` and `server/` layout (`App.jsx`, `ChatContainer`, repositories, routes).

### Fixed

- **chatHandler** — `start_booking` intent from `handleIdle` now returns the doctor-selection booking prompt instead of `null`, avoiding a fall-through with no reply in edge cases.

## [2.0.0] - 2026-04-05

### 🚀 Major Refactoring & Modernization

This release represents a complete overhaul of the codebase, transforming it from a basic class-based React application to a modern, production-ready chatbot frontend.

#### ✨ Added

- **Modern React Architecture**
  - Converted all class components to functional components with hooks
  - Implemented proper state management using `useState`, `useRef`, and `useEffect`
  - Added React 18 with new root API (`createRoot`)

- **Enhanced User Experience**
  - Added loading states with typing indicator
  - Implemented error handling with dismissible error banners
  - Added welcome message for empty chat state
  - Implemented auto-scroll to latest messages
  - Added keyboard support (Enter to send)

- **Responsive Design**
  - Complete CSS overhaul with modern styling
  - Mobile-first responsive design with breakpoints
  - Smooth animations and transitions
  - Custom scrollbar styling
  - Modern gradient background

- **Accessibility**
  - Added ARIA labels for interactive elements
  - Semantic HTML structure
  - Keyboard navigation support
  - Focus management

- **Developer Experience**
  - Environment variable configuration for API URL
  - Comprehensive documentation (README, ARCHITECTURE, CONTRIBUTING, CODEBASE_GUIDE)
  - Updated test suite with meaningful tests
  - Proper .gitignore configuration

#### 🔧 Changed

- **Dependencies Updated**
  - React: 16.13.1 → 18.2.0
  - React-DOM: 16.13.1 → 18.2.0
  - Axios: 0.20.0 → 1.6.0
  - React-Scripts: 3.4.3 → 5.0.1
  - Testing Library packages updated to latest versions

- **Code Quality**
  - Fixed typo: `msag` → `msg` in message objects
  - Changed `!=` to `!==` (strict equality)
  - Changed `class` to `className` in JSX
  - Removed `forceUpdate()` antipattern
  - Removed inefficient `setInterval` for scrolling
  - Removed unused dependencies (cors, jQuery, Bootstrap CDN)

- **Project Structure**
  - Moved project from `chatbot-master/` subdirectory to root
  - Organized components with associated CSS files
  - Removed unused files (serviceWorker, logo.svg, chat.jpg)
  - Proper component naming (Header.js instead of header.js)

#### 🐛 Fixed

- **Bug Fixes**
  - Fixed message state mutation (now using immutable updates)
  - Fixed scroll-to-bottom functionality (now uses useEffect)
  - Fixed input clearing (now clears before API call)
  - Fixed error handling (now shows user-friendly messages)
  - Fixed hardcoded API URL (now configurable via .env)

- **UI/UX Fixes**
  - Fixed non-responsive layout (was using fixed 500px margins)
  - Fixed message overflow issues
  - Fixed input field styling
  - Fixed button states (disabled during loading)

#### 🗑️ Removed

- **Deprecated Code**
  - Removed class-based components
  - Removed service worker registration
  - Removed unused Bootstrap CDN dependencies
  - Removed jQuery dependency
  - Removed unused assets (logo.svg, chat.jpg)

#### 📝 Documentation

- **New Documentation Files**
  - `README.md`: Comprehensive setup and usage guide
  - `ARCHITECTURE.md`: System architecture and data flow
  - `CONTRIBUTING.md`: Contribution guidelines
  - `CODEBASE_GUIDE.md`: Project structure explanation

- **Updated Files**
  - `package.json`: Updated with proper metadata
  - `public/index.html`: Updated meta tags and description
  - `public/manifest.json`: Updated app information

---

## [1.0.0] - Initial Release

### Original Features

- Basic chat interface with class-based React components
- Simple message sending and receiving
- Inline styling for all components
- Bootstrap CSS framework integration
- Create React App setup

### Known Issues (Now Fixed in 2.0.0)

- Non-responsive design with fixed positioning
- No error handling or loading states
- Hardcoded API URL
- Class component antipatterns
- Inefficient scroll handling
- Missing accessibility features
- Inconsistent naming conventions

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 2.0.0 | 2026-04-05 | Complete modernization and refactoring |
| 1.0.0 | Unknown | Initial release |

---

## Migration Guide (v1.0.0 → v2.0.0)

If you're upgrading from the original version:

### Breaking Changes

1. **React 18 Required**: Update your Node.js and dependencies
2. **Environment Variables**: Create `.env` file with `REACT_APP_API_URL`
3. **API Contract**: Ensure backend supports the same endpoint format

### Steps to Upgrade

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install updated dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your API URL

# 4. Start the application
npm start
```

### What's Different?

- **UI**: Completely redesigned with modern styling
- **Performance**: Improved with proper state management
- **Reliability**: Better error handling and loading states
- **Mobile**: Now fully responsive
- **Code**: Modern React with hooks instead of classes

---

## Future Roadmap

### Planned Features

- [ ] WebSocket support for real-time communication
- [ ] Message history persistence (localStorage)
- [ ] Message timestamps
- [ ] User authentication
- [ ] Chat history export
- [ ] Dark mode toggle
- [ ] Emoji support
- [ ] File attachment support
- [ ] Multi-language support
- [ ] Voice input support

### Under Consideration

- TypeScript migration
- State management library (Redux/Zustand)
- Component library (Material-UI/Chakra UI)
- End-to-end testing with Cypress
- Docker containerization
- CI/CD pipeline