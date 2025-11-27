import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const IDE = ({ language, initialCode, testCases }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');

  const runCode = () => {
    // Имитация запуска кода и проверки тестов
    let results = [];
    
    testCases.forEach((testCase, index) => {
      try {
        // В реальной системе здесь будет вызов бэкенда для выполнения в Docker
        // Это упрощенная имитация
        const isPassed = Math.random() > 0.3; // Случайный результат для демо
        
        if (isPassed) {
          results.push(
            <div key={index} className="test-result test-pass">
              ✅ Тест {index + 1}: Пройден
            </div>
          );
        } else {
          results.push(
            <div key={index} className="test-result test-fail">
              ❌ Тест {index + 1}: Не пройден. Ожидалось: {testCase.expected}
            </div>
          );
        }
      } catch (error) {
        results.push(
          <div key={index} className="test-result test-fail">
            💥 Тест {index + 1}: Ошибка выполнения
          </div>
        );
      }
    });

    setOutput(results);
  };

  return (
    <div className="ide-container">
      <div className="editor-container">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true
          }}
        />
      </div>
      
      <div className="controls-container">
        <button className="run-button" onClick={runCode}>
          ▶ Запустить код
        </button>
      </div>
      
      <div className="output-container">
        <strong>Результаты тестов:</strong>
        <div>{output}</div>
      </div>
    </div>
  );
};

export default IDE;