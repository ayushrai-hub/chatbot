# Contributing Guide

Thank you for your interest in contributing to the ChatBot project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## Code of Conduct

Please be respectful and constructive in your interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub and clone your fork:

```bash
git clone https://github.com/your-username/chatbot.git
cd chatbot
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## Development Workflow

### Running the Application

```bash
# Development mode with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build

# Check for linting issues
npm run lint
```

### Making Changes

1. **Small, Focused Commits**: Each commit should represent a single logical change
2. **Test Your Changes**: Ensure all tests pass before committing
3. **Update Documentation**: Update README.md or other docs if needed
4. **Follow Coding Standards**: Adhere to the project's coding style

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] No new linting errors
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### 2. Submitting the PR

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request from your fork to the main repository

3. Fill out the PR template with:
   - Description of changes
   - Related issues (if any)
   - Testing done
   - Screenshots (for UI changes)

### 3. Review Process

- A maintainer will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

## Coding Standards

### JavaScript/React

- Use **functional components** with hooks (no class components)
- Use **ES6+ syntax** (arrow functions, destructuring, etc.)
- Use **semicolons** consistently
- Use **single quotes** for strings
- Use **2 spaces** for indentation
- Maximum line length: **100 characters**

### Example Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

function ComponentName({ propName }) {
  // Hooks at the top
  const [state, setState] = useState(initialValue);

  // Event handlers
  const handleClick = () => {
    // Implementation
  };

  // Effects
  useEffect(() => {
    // Side effect logic
  }, [dependencies]);

  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
}

export default ComponentName;
```

### CSS

- Use **kebab-case** for class names
- Use **BEM naming convention** for complex components
- Use **CSS custom properties** for reusable values
- Use **mobile-first** responsive design

### File Naming

- **Components**: PascalCase (e.g., `Header.js`, `MessageBubble.js`)
- **CSS files**: Same name as component (e.g., `Header.css`)
- **Utilities**: camelCase (e.g., `apiHelper.js`)
- **Tests**: Same name with `.test.js` suffix (e.g., `App.test.js`)

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
# Feature
git commit -m "feat(message): add typing indicator animation"

# Bug fix
git commit -m "fix(api): handle network timeout errors"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(components): extract reusable hook"
```

### Commit Best Practices

1. **Atomic Commits**: Each commit should be a complete, logical unit
2. **Clear Messages**: Explain what and why, not how
3. **Reference Issues**: Use `#123` to reference related issues
4. **No Breaking Changes**: Unless in a major version bump

## Issue Reporting

### Bug Reports

When reporting a bug, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

### Feature Requests

When requesting a feature:

- **Use Case**: Explain why this feature is needed
- **Proposed Solution**: How you envision it working
- **Alternatives**: Any alternative solutions considered

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search existing issues
3. Open a new issue with your question

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!