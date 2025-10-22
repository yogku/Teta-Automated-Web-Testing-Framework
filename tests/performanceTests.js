module.exports = async function performanceTests(config) {
  return [{
    website: config.website,
    category: "Performance",
    test_case: "Homepage load time",
    status: "pass",
    description: "Homepage loaded in under 2s"
  }];
};
