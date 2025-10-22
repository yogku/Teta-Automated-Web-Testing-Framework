const allure = require('allure-commandline');
// Import all necessary 'fs' functions
const { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } = require('fs');

const resultsPath = './results/result-log.json';
const allureResultsDir = './allure-results';

// --- 1. Clean up old Allure results ---
// Delete the existing directory and its contents if it exists
if (existsSync(allureResultsDir)) {
  console.log(`Cleaning up old results directory: ${allureResultsDir}`);
  rmSync(allureResultsDir, { recursive: true, force: true });
}
// Recreate the empty directory
mkdirSync(allureResultsDir);
console.log(`Created empty results directory: ${allureResultsDir}`);

// --- 2. Read your framework's test results ---
let testResults;
try {
  testResults = JSON.parse(readFileSync(resultsPath, 'utf8'));
  console.log(`Successfully read test results from: ${resultsPath}`);
} catch (error) {
  console.error(`Could not read or parse ${resultsPath}. Make sure tests have been run.`, error);
  process.exit(1); // Exit if results can't be read
}

// --- 3. Convert your results to Allure's JSON format ---
console.log('Converting test results to Allure format...');
testResults.forEach(test => {
  // Use Math.random for quick unique IDs, might need better approach for larger scale
  const uniqueId = () => Math.random().toString(36).substring(2, 15);

  const allureResult = {
    uuid: uniqueId(),
    historyId: uniqueId(),
    name: test.test_case || test.testName || 'Unnamed Test', // Ensure a name is present
    status: test.status === 'pass' ? 'passed' : 'failed',
    stage: 'finished',
    steps: [{
      name: "Details",
      status: test.status === 'pass' ? 'passed' : 'failed',
      stage: 'finished',
      attachments: [{
        name: 'Test Info',
        type: 'text/plain',
        // Convert description/details to Buffer before encoding
        source: Buffer.from(test.description || test.details || 'No details provided').toString('base64')
      }]
    }],
    labels: [
      // Use the URL as the suite
      { name: 'suite', value: test.website || 'General Tests' },
      { name: 'feature', value: test.category || 'General' },
      { name: 'host', value: 'localhost' },
      // Add severity based on status? (Optional)
      { name: 'severity', value: test.status === 'pass' ? 'normal' : 'critical' }
    ],
    // Use slightly different start/stop for allure timeline view
    start: Date.now() - 100, // Pretend it started slightly earlier
    stop: Date.now()
  };

  // Save the new Allure JSON file
  const allureFilePath = `${allureResultsDir}/${allureResult.uuid}-result.json`;
  writeFileSync(allureFilePath, JSON.stringify(allureResult));
});
console.log(`Allure result files generated in: ${allureResultsDir}`);

// --- 4. Generate the Allure HTML report ---
console.log('Generating Allure report...');
// The '--clean' flag here ensures the *output* report directory is cleaned first
const generation = allure(['generate', allureResultsDir, '--clean']);

generation.on('exit', (exitCode) => {
  console.log(`Report generation finished with code: ${exitCode}`);
  if (exitCode === 0) {
    console.log('Opening Allure report...');
    allure(['open']); // Automatically open the report on success
  } else {
    console.error('Allure report generation failed.');
  }
});