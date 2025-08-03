const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const apiTests = require("./tests/apiTests");
const formTests = require("./tests/formTests");
const securityTests = require("./tests/securityTests");
const performanceTests = require("./tests/performanceTests");

let config;
try {
  config = require("./config/testConfig.json");
} catch (err) {
  console.error("Failed to load config:", err.message);
  config = {}; // fallback to empty config
}

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to run all tests
app.get("/run-tests", async (req, res) => {
  const results = [];

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

  // Create results dur if not exists
  const resultsDir = path.join(__dirname, "results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true }); // Creates nested directories if needed
  }

  try {
    // Create results dir if it does not exist
    const resultsDir = path.join(__dirname, "results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Save the results to the file inside the new directory
    fs.writeFileSync(path.join(resultsDir, "result-log.json"), JSON.stringify(results, null, 2));

  } catch (err) {
    console.error("Failed to save results:", err.message);
    return res.status(500).send("Error writing results to file.");
  }

  res.redirect("/results");
});

// Route to display results
app.get("/results", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("results/result-log.json"));
    res.render("results", { data });
  } catch (err) {
    console.error("Failed to load results:", err.message);
    res.status(500).send("Could not load test results.");
  }
});

// Global fallback for any uncaught errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send("Something went wrong.");
});

app.get("/", (req, res) => {
  res.redirect("/run-tests");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
