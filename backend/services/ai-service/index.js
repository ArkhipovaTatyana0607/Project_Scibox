const express = require('express');
const app = express();
const PORT = 5001;

const axios = require('axios');

app.use(express.json());

// Функция для получения ответа от AI
async function getAIResponse(message) {
  try {
    const response = await axios.post('https://api.scibox.ai/v1/chat/completions', {
      model: 'universal-chat',  // Уточни название модели
      messages: [{role: "user", content: message}],
      max_tokens: 500
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.SCIBOX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Scibox API error:', error.response?.data || error.message);
    
    // Запасные ответы если API недоступно
    const responses = {
      'привет': 'Привет! Расскажите о вашем подходе к решению задачи?',
      'алгоритм': 'Какой алгоритм вы выбрали и почему?',
      'ошибка': 'Давайте разберем ошибку. Что ожидали получить?',
      'оптимизация': 'Как можно оптимизировать ваше решение?',
      'default': 'Интересный подход! Можете объяснить логику решения?'
    };
    
    const lowerMessage = message.toLowerCase();
    return responses[lowerMessage] || responses.default;
  }
}

// Обработчик чата
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Сообщение обязательно' });
  }
  
  const reply = await getAIResponse(message);
  res.json({ reply, service: 'AI Service' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AI Service работает!', service: 'ai-service' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🤖 AI Service запущен на порту 5001');
});