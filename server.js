const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const apiTests = require("./tests/apiTests");
const formTests = require("./tests/formTests");
const securityTests = require("./tests/securityTests");
const performanceTests = require("./tests/performanceTests");
const seoAccessibilityTests = require("./tests/seoAccessibilityTests");

let config;
try {
  config = require("./config/testConfig.json");
} catch (err) {
  console.error("Failed to load config:", err.message);
  config = {}; // config to use if failed to load configfile
}

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to run all tests
app.get("/run-tests", async (req, res) => {
  const results = [];
  console.log("--- TEST RUN STARTING ---");

  try {
    if (typeof apiTests === "function") {
      results.push(...(await apiTests(config)));
    }
  } catch (err) {
    console.error("API tests failed:", err.message);
    results.push({ category: "API", error: err.message });
  }

  try {
    if (typeof formTests === "function") {
      results.push(...(await formTests(config)));
    }
  } catch (err) {
    console.error("Form tests failed:", err.message);
    results.push({ category: "Forms", error: err.message });
  }

  try {
    if (typeof securityTests === "function") {
      results.push(...(await securityTests(config)));
    }
  } catch (err) {
    console.error("Security tests failed:", err.message);
    results.push({ category: "Security", error: err.message });
  }

  try {
    if (typeof performanceTests === "function") {
      results.push(...(await performanceTests(config)));
    }
  } catch (err) {
    console.error("Performance tests failed:", err.message);
    results.push({ category: "Performance", error: err.message });
  }
  try {
    if (typeof seoAccessibilityTests === "function") {
      results.push(...(await seoAccessibilityTests(config)));
    }
  } catch (err) {
    console.error("SEO & Accessibility tests failed:", err.message);
    results.push({ category: "SEO & Accessibility", error: err.message });
  }

  // Create results dir if not exists
  const resultsDir = path.join(__dirname, "results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  try {
    // Save the results to the file inside the new directory
    fs.writeFileSync(path.join(resultsDir, "result-log.json"), JSON.stringify(results, null, 2));

  } catch (err) {
    console.error("Failed to save results:", err.message);
    return res.status(500).send("Error writing results to file.");
  }
  
  console.log("--- TEST RUN COMPLETE ---");
  res.redirect("/results");
  
});

// Route to display results
app.get("/results", (req, res) => {
  try {
    // Fixed the path to correctly find the results file
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, "results", "result-log.json")));
    res.render("results", { data });
  } catch (err) {
    console.error("Failed to load results:", err.message);
    res.status(500).send("Could not load test results.");
  }
});

// Global fallback for any uncaught errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  // An exit in case saving fails
    process.exit(1); // Exit with an error code
  res.status(500).send("Something went wrong.");
});

// Handle favicon.ico requests to prevent triggering tests
// This is still needed to prevent the tests from running twice
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // 204 No Content
});

app.get("/", (req, res) => {
  res.redirect("/run-tests");
  //TO MAKE THE SCRIPT EXIT AFTER TESTS ARE DONE
  process.exit(0);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));