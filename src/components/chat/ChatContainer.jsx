import React, { useState, useCallback, useRef, useMemo } from 'react';
import { sendChatMessage, getChatErrorMessage } from '../../services/chatApi';
import useChatScroll from '../../hooks/useChatScroll';
import MessageBubble from './MessageBubble';

function createMessageId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isLoadingRef = useRef(false);

  const scrollDeps = useMemo(() => [messages, isLoading], [messages, isLoading]);
  const messagesAreaRef = useChatScroll(scrollDeps);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    setError((prev) => (prev ? null : prev));
  }, []);

  const submitMessage = useCallback(async () => {
    const trimmedMessage = inputValue.trim();

    if (!trimmedMessage || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const userMessage = { id: createMessageId(), text: trimmedMessage, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const replyText = await sendChatMessage(trimmedMessage);
      const botMessage = { id: createMessageId(), text: replyText || '(empty response)', type: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(getChatErrorMessage(err));

      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInputValue(trimmedMessage);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [inputValue]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      void submitMessage();
    },
    [submitMessage],
  );

  return (
    <div className="chat-container" role="main">
      {error && (
        <div className="error-message" role="alert">
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
          <button
            type="button"
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="messages-area"
        ref={messagesAreaRef}
        role="log"
        aria-label="Chat messages"
        aria-relevant="additions"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              🤖
            </div>
            <p className="empty-state-text">
              Type <strong>menu</strong> or <strong>help</strong> to see FAQ questions, then reply with a number to
              get the answer. You can also use <strong>list doctors</strong> or <strong>book appointment</strong>.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg.text} type={msg.type} />
          ))
        )}

        {isLoading && (
          <div className="loading-indicator" aria-live="polite">
            <div className="loading-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span>Bot is typing…</span>
          </div>
        )}
      </div>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message…"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isLoading}
          aria-label="Message input"
          autoComplete="off"
          name="message"
        />
        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message"
        >
          {isLoading ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatContainer;
