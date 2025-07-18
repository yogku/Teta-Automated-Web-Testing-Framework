const axios = require("axios");

module.exports = async function apiTests(config) {
  const results = [];

  for (const test of config.customTests.api || []) {
    try {
      const res = await axios({
        method: test.method,
        url: config.website + test.endpoint,
        headers: test.authRequired ? { Authorization: "Bearer FAKE_TOKEN" } : {}
      });
      results.push({
        website: config.website,
        category: "API",
        test_case: `Status code check for ${test.endpoint}`,
        status: res.status === 200 ? "pass" : "fail",
        description: `Expected 200, got ${res.status}`
      });
    } catch (err) {
      results.push({
        website: config.website,
        category: "API",
        test_case: `Failed request to ${test.endpoint}`,
        status: "fail",
        description: err.message
      });
    }
  }

  return results;
};
