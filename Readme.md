# API & Web Testing Framework

## About

This project is a lightweight tool designed to automatically test backend APIs and common web application validation logic, such as login authentication and password handling. It detects errors by comparing expected versus actual API responses and generates a clear, intuitive web report for easy review and analysis.

## Features

This framework aims to provide comprehensive testing capabilities, including:

* **API Testing:** Validate API endpoints for correct responses, status codes, and data integrity.

* **Form Validation:** Automatically test form fields for proper data formatting, required fields, and boundary conditions.

* **Password Security Checks:**
    * Verify if passwords are encrypted when stored in the database (conceptual check, requires backend access).
    * Ensure passwords are not visible in URLs or improperly sent during the handshake process.

* **Boundary Testing:** Test forms and API inputs with extreme values (minimum, maximum, invalid types) to ensure robust error handling.

* **User Authentication:** Validate user authentication flows for APIs, including token handling and session management.

* **Performance Monitoring:**
    * Measure image load times to identify potential bottlenecks.
    * Monitor server response times for API calls and page loads.

* **Field Validation:** Check form fields to ensure required fields are present and data adheres to specified formats (e.g., email, phone number).

* **Null/Empty Value Checks:** Test for proper handling of empty or null values in form submissions and API requests.

* **SQL Injection Testing:** Attempt common SQL injection patterns to identify vulnerabilities.

* **API Rate Limit Detection:** Verify if API endpoints have proper rate limiting configured to prevent abuse.

## How It Works

The framework operates by reading test configurations from a `config.json` file. This file allows users to define custom test cases, API endpoints, and validation rules. Once the tests are executed (simulated in the current web-based version), the results are compiled and presented in an interactive web report, providing a clear overview of passed and failed tests.

## Installation

To set up the project locally:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/yogku/Teta-Automated-Testing-Framework.git](https://github.com/yogku/Teta-Automated-Testing-Framework.git)
    cd api-web-testing-framework
    ```

2.  **Initialize Project & Install dependencies:**
    This project uses Node.js. Make sure you have Node.js and npm (Node Package Manager) installed.

    ```bash
    npm init -y # Initializes a new Node.js project with default settings
    npm install express axios ejs body-parser
    ```

## Usage

1.  **Configure your tests:** Edit the `config.json` file to define your API endpoints, forms, and specific test scenarios.

2.  **Run the tests:**
    Start the Node.js server:

    ```bash
    node server.js
    ```

3.  **View the report:** Open your web browser and navigate to `http://localhost:3000/report.html` (or `index.html` if you rename it) to see the generated test results.

## Configuration (`config.json`)

The `config.json` file is central to defining your test suite. It allows you to specify:

* **`apiTests`**: An array of objects, each defining an API endpoint to test, including method (GET/POST), URL, headers, payload, and expected responses.

* **`formTests`**: An array of objects, each defining a form to test, including form URL, field selectors, and test data for various validation scenarios (e.g., boundary values, empty fields).

* **`securityChecks`**: Flags or configurations for specific security tests like SQL injection or password visibility.

* **`performanceChecks`**: URLs for image load time and server response time measurements.

* **`customTests`**: An array for defining highly specific, user-defined test cases.

**Example `config.json` structure:**

```json
{
  "website": "[https://yogku.github.io/](https://yogku.github.io/)",
  "customTests": {
    "api": [
      {
        "endpoint": "/api/test",
        "method": "GET",
        "authRequired": false
      }
    ]
  }
}


## Reporting

After test execution, a detailed web report is generated. This report provides:

- **Overall Summary**  
  A quick glance at the total number of tests, passes, and failures.

- **Categorized Results**  
  Tests are grouped by type:
  - API
  - Form
  - Security
  - Performance

- **Individual Test Details**  
  Each test case displays:
  - Status: Pass / Fail
  - Description
  - Expected Outcome
  - Actual Outcome
  - Relevant Error Messages (if any)

- **Clear Visuals**  
  Uses color-coding for better readability:
  - 🟩 Green for Pass
  - 🟥 Red for Fail

---

## contributors

- Navdeep Kaur
- Amish
 

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.
