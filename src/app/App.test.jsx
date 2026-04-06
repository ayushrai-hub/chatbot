import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chatbot header', () => {
  render(<App />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: /chat bot/i })).toBeInTheDocument();
});

test('renders message input field', () => {
  render(<App />);
  expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
});

test('renders send button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
});
