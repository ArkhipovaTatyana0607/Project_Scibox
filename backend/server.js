const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { CodeExecutor } = require('./services/code-executor');

const app = express();
const PORT = process.env.PORT || 5000;
const executor = new CodeExecutor();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ====== КОНФИГУРАЦИЯ МИКРОСЕРВИСОВ ======
const SERVICES = {
  AI: 'http://localhost:5001',
  INTERVIEW: 'http://localhost:5002',
  CODE: 'http://localhost:5003'
};

// ====== API GATEWAY - МАРШРУТИЗАЦИЯ ======

// Генерация задачи через Interview Service
app.post('/api/generate-task', async (req, res) => {
  try {
    const { level, language, topic } = req.body;
    console.log(`🎯 [Gateway] Routing to Interview Service: ${level} ${language} ${topic}`);
    
    const response = await axios.post(`${SERVICES.INTERVIEW}/generate-task`, {
      level, language, topic
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Interview Service error:', error.message);
    // Fallback - базовая генерация задач
    res.json({
      task: `Реализуйте функцию на ${req.body.language}, которая находит сумму всех чисел в массиве. Уровень: ${req.body.level}`,
      examples: ["Вход: [1, 2, 3] -> Выход: 6", "Вход: [10, -2, 5] -> Выход: 13"],
      hints: ["Используйте цикл для перебора элементов", "Не забудьте про инициализацию переменной"],
      test_cases: [
        { input: "[1, 2, 3]", expected: "6" },
        { input: "[10, -2, 5]", expected: "13" },
        { input: "[]", expected: "0" }
      ],
      function_name: "sumArray",
      service: 'Gateway Fallback'
    });
  }
});

// Чат с AI-интервьюером через AI Service
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log(`💬 [Gateway] Routing to AI Service: ${message.substring(0, 50)}...`);
    
    const response = await axios.post(`${SERVICES.AI}/chat`, {
      message, history
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ AI Service error:', error.message);
    // Fallback - базовая логика чата
    const lowerMessage = message.toLowerCase();
    let reply = "Интересный подход! Можете подробнее объяснить логику вашего решения?";
    
    if (lowerMessage.includes('привет')) {
      reply = "Привет! Я ваш AI-интервьюер. Расскажите о своем подходе к решению задачи?";
    } else if (lowerMessage.includes('алгоритм') || lowerMessage.includes('подход')) {
      reply = "Отличный выбор! Почему вы решили использовать именно этот подход? Какова его временная сложность?";
    } else if (lowerMessage.includes('ошибка')) {
      reply = "Давайте разберем ошибку. Какой результат вы ожидали получить и что получилось на самом деле?";
    }
    
    res.json({ 
      reply, 
      service: 'Gateway Fallback' 
    });
  }
});

// Выполнение кода через Code Service
app.post('/api/run-code', async (req, res) => {
  try {
    const { code, language, testCases } = req.body;
    console.log(`🔧 [Gateway] Routing to Code Service: ${language} code...`);
    
    const response = await axios.post(`${SERVICES.CODE}/execute`, {
      code, language, testCases
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Code Service error:', error.message);
    // Fallback - демо-режим выполнения
    const results = await executor.runInDocker(code, language, testCases);
    res.json({ 
      results, 
      service: 'Gateway Fallback (Code Service down)',
      warning: 'Running in fallback mode'
    });
  }
});

// Health check для Gateway
app.get('/api/health', (req, res) => {
  res.json({
    status: 'API Gateway работает!',
    timestamp: new Date().toISOString(),
    architecture: 'Microservices with API Gateway',
    services: {
      gateway: 'running',
      ai_service: SERVICES.AI,
      interview_service: SERVICES.INTERVIEW,
      code_service: SERVICES.CODE
    }
  });
});

// Health check микросервисов
app.get('/api/services/health', async (req, res) => {
  const healthStatus = {
    gateway: '✅ Running',
    ai_service: '🔴 Unknown',
    interview_service: '🔴 Unknown',
    code_service: '🔴 Unknown'
  };

  try {
    // Проверяем AI Service
    const aiResponse = await axios.get(`${SERVICES.AI}/health`).catch(() => null);
    healthStatus.ai_service = aiResponse ? '✅ Running' : '🔴 Down';
  } catch (error) {
    healthStatus.ai_service = '🔴 Down';
  }

  try {
    // Проверяем Interview Service
    const interviewResponse = await axios.get(`${SERVICES.INTERVIEW}/health`).catch(() => null);
    healthStatus.interview_service = interviewResponse ? '✅ Running' : '🔴 Down';
  } catch (error) {
    healthStatus.interview_service = '🔴 Down';
  }

  try {
    // Проверяем Code Service
    const codeResponse = await axios.get(`${SERVICES.CODE}/health`).catch(() => null);
    healthStatus.code_service = codeResponse ? '✅ Running' : '🔴 Down';
  } catch (error) {
    healthStatus.code_service = '🔴 Down';
  }

  res.json(healthStatus);
});

// Информация о поддерживаемых языках
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'javascript', name: 'JavaScript', version: 'Node.js 18' },
      { id: 'python', name: 'Python', version: '3.9' },
      { id: 'java', name: 'Java', version: 'OpenJDK 11' },
      { id: 'csharp', name: 'C#', version: '.NET 6.0' }
    ],
    service: 'API Gateway'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 API Gateway запущен на http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Services Health: http://localhost:${PORT}/api/services/health`);
  console.log(`🌍 Microservices Architecture:`);
  console.log(`   - AI Service: ${SERVICES.AI}`);
  console.log(`   - Interview Service: ${SERVICES.INTERVIEW}`);
  console.log(`   - Code Service: ${SERVICES.CODE}`);
  console.log(`🔐 Scibox API: ${process.env.SCIBOX_API_KEY ? 'Configured' : 'Not configured'}`);
});

module.exports = app;