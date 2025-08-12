const axios = require("axios");

/**
 * Executes a single API test case and formats the result.
 * @param {string} testCase - A descriptive name for the test.
 * @param {string} url - The full URL of the endpoint to test.
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {number} expectedStatus - The expected HTTP status code.
 * @param {any} data - The request body payload (optional).
 * @param {object} headers - Custom headers for the request (optional).
 * @returns {object} An object containing the test result.
 */
async function runTest(testCase, url, method, expectedStatus, data = null, headers = {}) {
  try {
    // Prevent axios from throwing an error on non-2xx status codes
    const res = await axios({
      method: method,
      url: url,
      data: data,
      headers: headers,
      validateStatus: () => true 
    });

    const statusCheck = res.status === expectedStatus;

    return {
      test_case: testCase,
      status: statusCheck ? "pass" : "fail",
      description: statusCheck
        ? `Expected status ${expectedStatus}, got ${res.status}`
        : `Expected status ${expectedStatus}, but got ${res.status}`
    };
  } catch (err) {
    const status = err.response ? err.response.status : 'No Response';
    
    // Handle cases where the request failed completely (e.g., network error)
    if (!err.response) {
      return {
        test_case: testCase,
        status: "fail",
        description: `Request failed: ${err.message}`
      };
    }

    const statusCheck = status === expectedStatus;
    
    return {
      test_case: testCase,
      status: statusCheck ? "pass" : "fail",
      description: statusCheck
        ? `Expected failure with status ${expectedStatus}, got ${status}`
        : `Expected failure with status ${expectedStatus}, but got ${status}`
    };
  }
}

module.exports = runTest;
