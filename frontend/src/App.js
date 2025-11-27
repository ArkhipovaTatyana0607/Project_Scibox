import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IDE from './components/IDE';
import InterviewerChat from './components/InterviewerChat';
import './App.css';

function App() {
  const [currentTask, setCurrentTask] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Загружаем первую задачу при старте
  useEffect(() => {
    generateNewTask('Junior', 'JavaScript', 'Массивы');
  }, []);

  const generateNewTask = async (level, language, topic) => {
    try {
      const response = await axios.post('http://localhost:5000/api/generate-task', {
        level,
        language,
        topic
      });
      setCurrentTask(response.data);
    } catch (error) {
      console.error('Ошибка при получении задачи:', error);
      alert('Не удалось загрузить задачу. Проверьте, запущен ли бэкенд.');
    }
  };

  const sendMessageToAI = async (message) => {
    const newMessage = { role: 'user', content: message };
    const updatedHistory = [...conversationHistory, newMessage];
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message,
        history: updatedHistory
      });
      
      const aiResponse = { role: 'assistant', content: response.data.reply };
      setConversationHistory([...updatedHistory, aiResponse]);
    } catch (error) {
      console.error('Ошибка общения с AI:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>VibeCode AI Interview</h1>
        <p>Адаптивное техническое собеседование</p>
      </header>

      <div className="app-body">
        <div className="task-section">
          <h2>Задача</h2>
          {currentTask ? (
            <div className="task-content">
              <div className="task-description">
                <p>{currentTask.task}</p>
                
                <h4>Примеры:</h4>
                <ul>
                  {currentTask.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>

                <h4>Подсказки:</h4>
                <ul>
                  {currentTask.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>

              <div className="ide-section">
                <IDE 
                  language="javascript"
                  initialCode={`function sumArray(arr) {\n  // Ваш код здесь\n  \n}`}
                  testCases={currentTask.test_cases}
                />
              </div>
            </div>
          ) : (
            <p>Загрузка задачи...</p>
          )}
        </div>

        <div className="chat-section">
          <InterviewerChat 
            conversation={conversationHistory}
            onSendMessage={sendMessageToAI}
          />
        </div>
      </div>
    </div>
  );
}

export default App;