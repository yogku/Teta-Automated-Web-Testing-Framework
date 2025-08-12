const runTest = require("./runTest");
const axios = require("axios");

/**
 * Generates a unique username and a default password for each test run.
 * @returns {{username: string, password: string}}
 */
function generateUniqueUser() {
  const username = `test_user_${Date.now()}`;
  const password = "test_password";
  return { username, password };
}

/**
 * Executes a rate limit test by sending multiple requests to an endpoint.
 * @param {string} url - The URL to test.
 * @param {number} numRequests - The number of requests to send.
 * @returns {object} The test result.
 */
async function testRateLimiting(url, numRequests) {
  const testName = "Rate Limiting Test";
  const requests = [];

  console.log(`--- Starting Rate Limit Test for: ${url} ---`);

  for (let i = 0; i < numRequests; i++) {
    requests.push(axios.post(url, {}, { validateStatus: () => true }));
  }

  try {
    const responses = await Promise.all(requests);
    const hasRateLimitedResponse = responses.some(res => res.status === 429);

    return {
      test_case: `${testName}: Endpoint has rate limit`,
      status: hasRateLimitedResponse ? "pass" : "fail",
      description: hasRateLimitedResponse ?
        `Successfully received a 429 status code after rapid requests.` :
        `Did not receive a 429 status code after rapid requests.`
    };
  } catch (err) {
    return {
      test_case: `${testName}: Failed to perform rate limit test`,
      status: "fail",
      description: `Request failed during rate limit test: ${err.message}`
    };
  }
}

module.exports = async function apiTests(config) {
  const results = [];
  const testData = {};
  const { backendUrl, customTests } = config; // Removed frontendUrl as it's not needed here
  const { username, password } = generateUniqueUser();

  console.log("--- Starting API Tests from Config ---");

  for (const testCase of customTests.api) {
    let fullUrl = `${backendUrl}${testCase.endpoint}`;
    let payload = testCase.payload ? JSON.parse(JSON.stringify(testCase.payload)) : null;

    // Handle dynamic values for username, password, and userId
    if (payload && payload.username === "{{unique_username}}") {
      payload.username = username;
      payload.password = password;
    }
    if (testCase.endpoint.includes(':userId') && testData.userId) {
      fullUrl = fullUrl.replace(':userId', testData.userId);
    }

    // Prepare headers if authentication is required
    const headers = testCase.authRequired ? { Authorization: `Bearer ${testData.accessToken}` } : {};

    let testResult;
    if (testCase.isRateLimitTest) {
      // Handle the rate limit test separately
      testResult = await testRateLimiting(fullUrl, testCase.numRequests);
    } else {
      // Handle standard API tests
      testResult = await runTest(
        testCase.testName,
        fullUrl,
        testCase.method,
        testCase.expectedStatus,
        payload,
        headers
      );
    }

    testResult.website = backendUrl;
    testResult.category = "API";
    results.push(testResult);

    if (testCase.testName === "Test 2: Login with valid credentials" && testResult.status === "pass") {
      try {
        // The userId and token must be captured from the *response* of the login test.
        const loginRes = await axios.post(fullUrl, payload);
        testData.accessToken = loginRes.data.accessToken;
        testData.userId = loginRes.data.userId;
      } catch (err) {
        console.error("Failed to retrieve token after successful login test.");
      }
    }
  }
  return results;
};