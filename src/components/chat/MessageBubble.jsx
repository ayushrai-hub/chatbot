import React from 'react';

function MessageBubble({ message, type }) {
  const isUser = type === 'user';

  return (
    <div className={`message ${isUser ? 'user' : 'bot'}`} role="listitem">
      <span className="message-label">{isUser ? 'You' : 'Bot'}</span>
      <div className="message-bubble">{message}</div>
    </div>
  );
}

export default MessageBubble;
