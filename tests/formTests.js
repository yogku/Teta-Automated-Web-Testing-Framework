const axios = require("axios");

/**
 * Generates a unique username and a default password for each test run.
 * @returns {{username: string, password: string}}
 */
function generateUniqueUser() {
  const username = `test_user_${Date.now()}`;
  // Use a password that passes your backend validation
  const password = "Password123"; 
  return { username, password };
}

module.exports = async function formTests(config) {
  const results = [];
  const tests = config.customTests ? config.customTests.formTests : [];

  for (const test of tests) {
    const url = config.backendUrl + test.endpoint;
    // Create a copy of the payload to avoid changing the original
    let finalPayload = JSON.parse(JSON.stringify(test.payload));

    // --- ADD THIS LOGIC ---
    // Check for and replace the placeholder
    if (finalPayload.username === "{{unique_username}}") {
      const dynamicUser = generateUniqueUser();
      finalPayload.username = dynamicUser.username;
      finalPayload.password = dynamicUser.password;
    }
    // ----------------------

    try {
      const res = await axios({
        method: "POST",
        url: url,
        data: finalPayload, // Use the final payload with the replaced username
      });

      // ... The rest of your pass/fail logic remains the same ...
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