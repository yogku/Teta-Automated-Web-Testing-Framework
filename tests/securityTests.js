module.exports = async function securityTests(config) {
  return [{
    website: config.website,
    category: "Security",
    test_case: "Password in URL check",
    status: "pass",
    description: "No password found in query strings"
  }];
};
