const runTest = require("./runTest");
const axios = require("axios");

/**
 * Generates a unique username and a default password for each test run.
 * @returns {{username: string, password: string}}
 */
function generateUniqueUser() {
  const username = `test_user_${Date.now()}`;
  const password = "Testpassword123"; 
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
  const testData = {}; // Will hold accessToken, userId, itemId
  const { backendUrl, customTests } = config; 
  const { username, password } = generateUniqueUser();

  console.log("--- Starting API Tests from Config ---");

  for (const testCase of customTests.api) {
    let fullUrl = `${backendUrl}${testCase.endpoint}`;
    let payload = testCase.payload ? JSON.parse(JSON.stringify(testCase.payload)) : null;

    // Handle dynamic values for username, password
    if (payload && payload.username === "{{unique_username}}") {
      payload.username = username;
      payload.password = password;
    }
    

    // Replace :userId if it exists AND we have one
    if (testCase.endpoint.includes(':userId') && testData.userId) {
      fullUrl = fullUrl.replace(':userId', testData.userId);
    }
    // Replace :itemId if it exists AND we have one
    if (testCase.endpoint.includes(':itemId') && testData.itemId) {
      fullUrl = fullUrl.replace(':itemId', testData.itemId);
    }

    const headers = testCase.authRequired ? { Authorization: `Bearer ${testData.accessToken}` } : {};

    let testResult;
    if (testCase.isRateLimitTest) {
      testResult = await testRateLimiting(fullUrl, testCase.numRequests);
    } else {
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


    if (testCase.testName === "Test 2: Login with valid credentials (Success)" && testResult.status === "pass") {
      console.log('Login Response Body:', testResult.data);
     
      if (testResult.data && testResult.data.accessToken && testResult.data.userId) {
        testData.accessToken = testResult.data.accessToken;
        testData.userId = testResult.data.userId;
        console.log(`--- Captured accessToken and userId for subsequent tests ---`);
      } else {
        console.error("Login test passed, but response data (accessToken/userId) was not found in testResult.");
      }
    }


    if (testCase.testName === "Test 5: Add item to cart with valid token" && testResult.status === "pass") {
      try {
        if (testResult.data && testResult.data.items && testResult.data.items.length > 0) {
          testData.itemId = testResult.data.items[testResult.data.items.length - 1]._id;
          console.log(`--- Captured itemId (${testData.itemId}) for subsequent tests ---`);
        } else {
          console.error("Add item test passed, but 'itemId' was not found in response: ", testResult.data);
        }
      } catch (e) {
        console.error("Error capturing itemId: ", e.message);
      }
    }

  }
  return results;
};