/**
 * HTTP client and chat API for the backend.
 */
import axios from 'axios';
import config from '../config';

const client = axios.create({
  baseURL: config.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

const SESSION_STORAGE_KEY = 'appointmentChatSessionId';

function getStoredSessionId() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setStoredSessionId(id) {
  try {
    if (id) sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  } catch {
    /* ignore private mode / SSR */
  }
}

/**
 * Normalize backend body to a display string.
 * Supports plain string, or common JSON shapes.
 */
export function normalizeBotReply(data) {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const stringKeys = ['reply', 'message', 'msg', 'answer', 'text', 'response', 'content'];
    for (const key of stringKeys) {
      if (typeof data[key] === 'string') return data[key];
    }
    if (typeof data.data === 'string') return data.data;
    if (data.data && typeof data.data === 'object' && typeof data.data.message === 'string') {
      return data.data.message;
    }
  }
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

/**
 * POST /user { msg } → bot reply text
 */
export async function sendChatMessage(message) {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }

  const payload = { msg: trimmed };
  const existing = getStoredSessionId();
  if (existing) {
    payload.sessionId = existing;
  }

  const response = await client.post('/user', payload);
  const nextSession = response.data?.sessionId;
  if (nextSession) {
    setStoredSessionId(nextSession);
  }
  return normalizeBotReply(response.data);
}

const DEFAULT_ERROR = 'Failed to send message. Please try again.';

/**
 * Human-readable message from axios/network errors (handles object/string bodies).
 */
export function getChatErrorMessage(err, fallback = DEFAULT_ERROR) {
  if (err == null) return fallback;

  const noResponse = !err.response;
  const network =
    err.code === 'ERR_NETWORK' ||
    err.message === 'Network Error' ||
    (noResponse && err.message && /network/i.test(err.message));

  if (network) {
    const target = config.apiUrl || 'http://localhost:5050 (via dev proxy)';
    return `Cannot reach the API (${target}). Start the backend: in the project root run \`npm run server\` (port 5050), then keep \`npm start\` running.`;
  }

  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) return data.trim();

  if (data && typeof data === 'object') {
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (data.error != null && typeof data.error !== 'string') {
      try {
        return JSON.stringify(data.error);
      } catch {
        return fallback;
      }
    }
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }

  return fallback;
}

export default client;
