const allure = require('allure-commandline');
const { readFileSync, existsSync, mkdirSync, writeFileSync } = require('fs');

// 1. Read your existing result-log.json file
let testResults;
try {
  testResults =JSON.parse(readFileSync('./results/result-log.json', 'utf8'));
} catch (error) {
  console.error("Could not read or parse result-log.json. Make sure tests have been run.", error);
  process.exit(1);
}

// 2. Convert your JSON to Allure's JSON format
const allureResultsDir = './allure-results';
if (!existsSync(allureResultsDir)) {
  mkdirSync(allureResultsDir);
}

testResults.forEach(test => {
  const allureResult = {
    uuid: Math.random().toString(36).substring(2, 15), // Generate a random ID
    historyId: Math.random().toString(36).substring(2, 15),
    name: test.test_case || test.testName,
    status: test.status === 'pass' ? 'passed' : 'failed',
    stage: 'finished',
    steps: [{
      name: "Details",
      status: test.status === 'pass' ? 'passed' : 'failed',
      stage: 'finished',
      attachments: [{
        name: 'Test Info',
        type: 'text/plain',
        source: Buffer.from(test.description || test.details || '').toString('base64')
      }]
    }],
    labels: [
    { name: 'suite', value: test.website || 'General Tests' }, // Add this line
    { name: 'feature', value: test.category || 'General' },
    { name: 'host', value: 'localhost' }
  ],
    start: Date.now(),
    stop: Date.now() + 1
  };

  // Save the new Allure JSON file
  writeFileSync(`${allureResultsDir}/${allureResult.uuid}-result.json`, JSON.stringify(allureResult));
});

// 3. Generate the Allure HTML report
const generation = allure(['generate', allureResultsDir, '--clean']);
generation.on('exit', (exitCode) => {
  console.log('Report generation finished with code:', exitCode);
  allure(['open']); // Automatically open the report
});