const axios = require("axios");

/**
 * Executes a single API test case and formats the result.
 * @param {string} testCase - 
 * @param {string} url 
 * @param {string} method 
 * @param {number} expectedStatus 
 * @param {any} data 
 * @param {object} headers 
 * @returns {object} 
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
        : `Expected status ${expectedStatus}, but got ${res.status}`,
      data: res.data 
    };

  } catch (err) {

    return {
      test_case: testCase,
      status: "fail",
      description: `Request failed: ${err.message}`
    };
  }
}

module.exports = runTest;