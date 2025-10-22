const axios = require("axios");

module.exports = async function formTests(config) {
  const results = [];
  // Reads from the new nested path
  const tests = config.customTests ? config.customTests.formTests : [];

  if (!tests || !Array.isArray(tests)) {
    return results;
  }

  for (const test of tests) {
    // Uses the new backendUrl variable
    const url = config.backendUrl + test.endpoint;
    try {
      const res = await axios({
        method: "POST",
        url: url,
        data: test.payload,
      });

      if (res.status === test.expectedStatus) {
        results.push({
          website: config.backendUrl,
          category: "Form Validation",
          test_case: test.testName,
          status: "pass",
          description: `Received expected status: ${res.status}`,
        });
      } else {
        results.push({
          website: config.backendUrl,
          category: "Form Validation",
          test_case: test.testName,
          status: "fail",
          description: `Expected status ${test.expectedStatus}, but got ${res.status}`,
        });
      }
    } catch (err) {
      if (err.response && err.response.status === test.expectedStatus) {
        results.push({
          website: config.backendUrl,
          category: "Form Validation",
          test_case: test.testName,
          status: "pass",
          description: `Correctly received expected error status: ${err.response.status}`,
        });
      } else {
        results.push({
          website: config.backendUrl,
          category: "Form Validation",
          test_case: test.testName,
          status: "fail",
          description: err.message,
        });
      }
    }
  }

  return results;
};