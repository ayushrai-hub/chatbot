/**
 * Runtime configuration (env-driven, frozen).
 *
 * Development: leave REACT_APP_API_URL unset to use Create React App's `proxy`
 * (see root package.json) — requests go to the same origin and forward to :5050.
 * Production: set REACT_APP_API_URL to your deployed API origin (no trailing slash).
 */
function resolveApiUrl() {
  const env = process.env.REACT_APP_API_URL;
  if (env != null && String(env).trim() !== '') {
    return String(env).trim().replace(/\/$/, '');
  }
  return '';
}

const config = {
  apiUrl: resolveApiUrl(),
};

Object.freeze(config);

export default config;
