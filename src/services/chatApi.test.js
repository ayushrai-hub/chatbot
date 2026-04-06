import { normalizeBotReply, getChatErrorMessage } from './chatApi';

describe('normalizeBotReply', () => {
  it('returns strings as-is', () => {
    expect(normalizeBotReply('hello')).toBe('hello');
  });

  it('extracts common object keys', () => {
    expect(normalizeBotReply({ reply: 'ok' })).toBe('ok');
    expect(normalizeBotReply({ message: 'm' })).toBe('m');
  });

  it('handles null', () => {
    expect(normalizeBotReply(null)).toBe('');
  });
});

describe('getChatErrorMessage', () => {
  it('uses fallback when err is null', () => {
    expect(getChatErrorMessage(null, 'x')).toBe('x');
  });

  it('reads string response body', () => {
    expect(getChatErrorMessage({ response: { data: '  bad  ' } })).toBe('bad');
  });

  it('reads data.error string', () => {
    expect(getChatErrorMessage({ response: { data: { error: 'nope' } } })).toBe('nope');
  });

  it('explains axios network errors', () => {
    expect(getChatErrorMessage({ message: 'Network Error', code: 'ERR_NETWORK' })).toContain(
      'Cannot reach the API',
    );
  });
});
