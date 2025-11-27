const express = require('express');
const { CodeExecutor } = require('../code-executor');
const app = express();
const PORT = 5003;

app.use(express.json());
const executor = new CodeExecutor();

app.post('/execute', async (req, res) => {
  const { code, language, testCases } = req.body;
  console.log(`?? [Code Service] Executing ${language} code...`);
  
  const results = await executor.runInDocker(code, language, testCases);
  res.json({ results, service: 'Code Execution Service' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Code Service работает!', service: 'code-service' });
});

app.listen(PORT, () => {
  console.log(`?? Code Execution Service запущен на порту ${PORT}`);
});