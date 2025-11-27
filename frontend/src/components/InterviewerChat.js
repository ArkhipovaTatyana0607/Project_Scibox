import React, { useState, useRef, useEffect } from 'react';

const InterviewerChat = ({ conversation, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {conversation.length === 0 ? (
          <div className="chat-message message-assistant">
            Привет! Я ваш AI-интервьюер. Расскажите о своем подходе к решению задачи.
          </div>
        ) : (
          conversation.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.role === 'user' ? 'message-user' : 'message-assistant'
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Расскажите о вашем подходе к решению..."
        />
        <button type="submit" className="chat-send-button">
          Отправить
        </button>
      </form>
    </div>
  );
};

export default InterviewerChat;