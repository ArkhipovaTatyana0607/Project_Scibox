class CodeExecutor {
  async runInDocker(code, language, testCases) {
    console.log(`?? Executing ${language} code (DEMO MODE)...`);
    
    // Демо-режим без Docker
    return this.runInDemoMode(code, language, testCases);
  }

  runInDemoMode(code, language, testCases) {
    // Упрощенная проверка для демо
    const results = [];
    
    testCases.forEach((testCase, index) => {
      try {
        // Простая логика проверки для демо
        const isPassed = Math.random() > 0.3; // 70% шанс успеха
        
        if (isPassed) {
          results.push({
            test: index + 1,
            passed: true,
            input: testCase.input,
            expected: testCase.expected,
            actual: this.getDemoResult(testCase.expected)
          });
        } else {
          results.push({
            test: index + 1,
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: "incorrect_result",
            error: "Demo error - check your logic"
          });
        }
      } catch (error) {
        results.push({
          test: index + 1,
          passed: false,
          error: `Demo execution error: ${error.message}`
        });
      }
    });

    return results;
  }

  getDemoResult(expected) {
    // Генерируем реалистичный результат для демо
    try {
      const expectedValue = JSON.parse(expected);
      return JSON.stringify(expectedValue);
    } catch {
      return expected;
    }
  }
}

module.exports = { CodeExecutor };