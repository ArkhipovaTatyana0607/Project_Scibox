const express = require('express');
const app = express();
const PORT = 5002;

const axios = require('axios');

app.use(express.json());

// Функция для генерации задачи через Scibox API
async function generateCodingTask(topic, difficulty, language) {
  try {
    const response = await axios.post('https://api.scibox.ai/v1/completions', {
      model: 'qwen3-32b-awq',  
      prompt: `Сгенерируй задачу по программированию на языке ${language} на тему ${topic}, сложность: ${difficulty}. Формат: описание задачи, пример входных/выходных данных, название функции.`,
      max_tokens: 1000
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.SCIBOX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Scibox API error:', error.response?.data || error.message);
    
    // Запасная задача если API недоступно
    return {
      task: `Реализуйте функцию на ${language} для работы с массивами. Уровень: ${difficulty}`,
      examples: ["Вход: [1,2,3]", "Выход: 6"],
      hints: ["Используйте цикл для перебора элементов", "Проверьте граничные случаи"],
      test_cases: [
        { input: "[1,2,3]", expected: "6" },
        { input: "[]", expected: "0" }
      ],
      function_name: "sumArray"
    };
  }
}

// Обработчик генерации задач
app.post('/generate-task', async (req, res) => {
  const { level, language, topic } = req.body;
  
  if (!level || !language || !topic) {
    return res.status(400).json({ 
      error: 'Обязательные параметры: level, language, topic' 
    });
  }
  
  try {
    const generatedTask = await generateCodingTask(topic, level, language);
    
    // Если API вернуло текст, преобразуем в объект
    let task;
    if (typeof generatedTask === 'string') {
      task = {
        task: generatedTask,
        examples: ["Пример входных/выходных данных будет здесь"],
        hints: ["Используйте подходящие структуры данных", "Обработайте все граничные случаи"],
        test_cases: [
          { input: "тестовые_данные", expected: "ожидаемый_результат" }
        ],
        function_name: "solveProblem",
        service: 'Interview Service'
      };
    } else {
      // Если уже объект (из запасного варианта)
      task = {
        ...generatedTask,
        service: 'Interview Service'
      };
    }
    
    res.json(task);
  } catch (error) {
    console.error('Task generation error:', error);
    res.status(500).json({ 
      error: 'Ошибка при генерации задачи',
      service: 'Interview Service'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Interview Service работает!', service: 'interview-service' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🎯 Interview Service запущен на порту 5002');
});
