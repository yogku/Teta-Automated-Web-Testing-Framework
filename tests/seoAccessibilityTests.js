const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function seoAccessibilityTests(config) {
  const results = [];
  const urlToTest = config.homepageUrl;

  if (!urlToTest) {
    return [];
  }

  let html;
  try {
    const response = await axios.get(urlToTest);
    html = response.data;
  } catch (err) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Homepage Availability',
      status: 'fail',
      description: `Could not fetch URL. Error: ${err.message}`
    });
    return results;
  }

  const $ = cheerio.load(html);

  // --- Test 1: Title Tag Check ---
  const title = $('title').text();
  if (!title) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Title Tag Check',
      status: 'fail',
      description: 'The page is missing a <title> tag.'
    });
  } else {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Title Tag Check',
      status: 'pass',
      description: `Title found: "${title}"`
    });
  }

  // --- Test 2: Image Alt Text Check ---
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');
  if (imagesWithoutAlt.length > 0) {
    imagesWithoutAlt.each((index, element) => {
      const src = $(element).attr('src') || `Image #${index + 1}`;
      results.push({
        website: urlToTest,
        category: 'SEO & Accessibility',
        test_case: `Image Alt Text: ${src}`,
        status: 'fail',
        description: 'Image is missing its alt text.'
      });
    });
  } else {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Image Alt Text Check',
      status: 'pass',
      description: 'All images have alt text.'
    });
  }
  // --- Test 3: Check for Language Attribute ---
  const lang = $('html').attr('lang');
  if (!lang) {
    results.push({
        website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Language Attribute Check',
      status: 'fail',
      description: 'The <html> tag is missing the lang attribute.'
    });
  } else {
    results.push({
        website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Language Attribute Check',
      status: 'pass',
      description: `Language specified: "${lang}"`
    });
  }
// --- Test 4: Check for Broken Links ---
  const links = $('a');
  const linkPromises = [];

  if (links.length === 0) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Broken Link Check',
      status: 'pass',
      description: 'No links found on the page to check.'
    });
  } else {
    links.each((index, element) => {
      const href = $(element).attr('href');
      if (href && (href.startsWith('http') || href.startsWith('https'))) {
        const linkCheckPromise = axios.get(href)
          .then(response => {
            // This result is created only for valid links
          })
          .catch(error => {
            results.push({
              website: urlToTest,
              category: 'SEO & Accessibility',
              test_case: `Link Check: ${href}`,
              status: 'fail',
              description: `Link is broken. Error: ${error.message}`
            });
          });
        linkPromises.push(linkCheckPromise);
      }
    });
  }

  // Wait for all the link checks to complete before returning
  await Promise.all(linkPromises);

  // Add a final "pass" status if no broken links were found
  if (links.length > 0 && results.filter(r => r.test_case.includes('Link Check')).length === 0) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Broken Link Check',
      status: 'pass',
      description: 'All links on the page are valid.'
    });
  }
  // --- Test 5: Check for a Single H1 Tag ---
  const h1s = $('h1');
  if (h1s.length === 0) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'H1 Tag Check',
      status: 'fail',
      description: 'Page is missing an H1 tag.'
    });
  } else if (h1s.length > 1) {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'H1 Tag Check',
      status: 'fail',
      description: 'Page has more than one H1 tag.'
    });
  } else {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'H1 Tag Check',
      status: 'pass',
      description: 'Page has exactly one H1 tag.'
    });
  }
    // --- Test 6: Check for Meta Description ---
  const description = $('meta[name="description"]').attr('content');
  if (!description || description.trim() === '') {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Meta Description Check',
      status: 'fail',
      description: 'Page is missing a meta description.'
    });
  } else {
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Meta Description Check',
      status: 'pass',
      description: 'Page has a meta description.'
    });
  }

  return results;
};