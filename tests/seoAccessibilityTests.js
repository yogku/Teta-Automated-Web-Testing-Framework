const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function seoAccessibilityTests(config) {
  const results = [];
  const { backendUrl, pagesToTest } = config; // Read the correct config object
  let accessToken = null;

  // --- Step 1: Log in to get a token for private pages ---
  try {
    const loginResponse = await axios.post(`${backendUrl}/login`, {
      username: 'erenYager', // Use a valid, existing user for testing
      password: 'Eren@123'
    });
    accessToken = loginResponse.data.accessToken;
  } catch (err) {
    results.push({
      category: 'Setup',
      test_case: 'User Login',
      status: 'fail',
      description: `Could not log in to test private pages. Error: ${err.message}`
    });
    // Continue testing public pages even if login fails
  }

  // --- Step 2: Reusable function to run all checks on a single page ---
  const runChecksOnPage = async (url, headers = {}) => {
    let html;
    try {
      const response = await axios.get(url, { headers });
      html = response.data;
    } catch (err) {
      results.push({ website: url, category: 'Page Load', test_case: `Page Availability`, status: 'fail', description: `Failed to load page. Error: ${err.message}` });
      return; // Stop checking this page if it fails to load
    }

    const $ = cheerio.load(html);

    // --- All your checks go inside this function ---

    // Title Tag Check
    const title = $('title').text();
    results.push({ website: url, category: 'SEO', test_case: 'Title Tag Check', status: title ? 'pass' : 'fail', description: title ? `Title found: "${title}"` : 'Missing title tag.' });

    // H1 Tag Check
    const h1s = $('h1');
    results.push({ website: url, category: 'SEO', test_case: 'H1 Tag Check', status: h1s.length === 1 ? 'pass' : 'fail', description: `Found ${h1s.length} H1 tags (should be 1).` });

    // Meta Description Check
    const description = $('meta[name="description"]').attr('content');
    results.push({ website: url, category: 'SEO', test_case: 'Meta Description Check', status: description ? 'pass' : 'fail', description: description ? 'Meta description is present.' : 'Missing meta description.' });

    // Image Alt Text Check
    const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
    if (imagesWithoutAlt.length > 0) {
        imagesWithoutAlt.each((index, element) => {
            const src = $(element).attr('src') || `Image #${index + 1}`;
            results.push({ website: url, category: 'Accessibility', test_case: `Image Alt Text: ${src}`, status: 'fail', description: 'Image is missing alt text.'});
        });
    } else {
        // Only add one 'pass' result per page if all images are okay
        results.push({ website: url, category: 'Accessibility', test_case: 'Image Alt Text Check', status: 'pass', description: 'All images appear to have alt text.'});
    }

    // Language Attribute Check
    const lang = $('html').attr('lang');
    results.push({ website: url, category: 'Accessibility', test_case: 'Language Attribute Check', status: lang ? 'pass' : 'fail', description: lang ? `Language specified: "${lang}"` : 'Missing lang attribute.' });

    // Input Label Check
    const inputsWithoutLabels = [];
    $('input, textarea, select').each((i, el) => {
      const id = $(el).attr('id');
      if (!id || !$(`label[for="${id}"]`).length) {
        if (!$(el).attr('aria-label')) {
          inputsWithoutLabels.push(id || $(el).attr('name') || `Input #${i + 1}`);
        }
      }
    });
    results.push({ website: url, category: 'Accessibility', test_case: 'Input Label Check', status: inputsWithoutLabels.length === 0 ? 'pass' : 'fail', description: inputsWithoutLabels.length === 0 ? 'All inputs have labels.' : `Missing labels for inputs: ${inputsWithoutLabels.join(', ')}` });

    // Favicon Check
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]');
    results.push({ website: url, category: 'SEO & Accessibility', test_case: 'Favicon Check', status: favicon.length > 0 ? 'pass' : 'fail', description: favicon.length > 0 ? 'Favicon link is present.' : 'Missing favicon link.' });

    // Broken Link Check (Simplified version)
    const links = $('a');
    if (links.length === 0) {
      results.push({ website: url, category: 'SEO & Accessibility', test_case: 'Broken Link Check', status: 'pass', description: 'No links found.' });
    } else {
      let brokenLinksFound = false;
      const linkPromises = [];
      links.each((index, element) => {
        const href = $(element).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('https'))) {
          linkPromises.push(
            axios.get(href).catch(error => {
              brokenLinksFound = true;
              results.push({ website: url, category: 'SEO & Accessibility', test_case: `Broken Link: ${href}`, status: 'fail', description: `Link is broken. Error: ${error.message}` });
            })
          );
        }
      });
      await Promise.all(linkPromises);
      if (!brokenLinksFound) {
        results.push({ website: url, category: 'SEO & Accessibility', test_case: 'Broken Link Check', status: 'pass', description: 'All external links appear valid.' });
      }
    }
  }; // End of runChecksOnPage function

  // Step 3: Loop through and test all pages from your config
  if (pagesToTest && pagesToTest.public) {
    for (const url of pagesToTest.public) {
      await runChecksOnPage(url);
    }
  }

  if (accessToken && pagesToTest && pagesToTest.private) { // Only test private pages if login succeeded
    const authHeaders = { 'Authorization': `Bearer ${accessToken}` };
    for (const url of pagesToTest.private) {
      await runChecksOnPage(url, authHeaders);
    }
  }

  return results;
};