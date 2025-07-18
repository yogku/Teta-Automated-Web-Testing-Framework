module.exports = async function formTests(config) {
  return [{
    website: config.website,
    category: "Form Validation",
    test_case: "Sample required field test",
    status: "fail",
    description: "Field 'email' accepted empty value"
  }];
};
