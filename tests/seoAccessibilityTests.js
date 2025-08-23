const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function seoAccessibilityTests(config) {
  const results = [];
  const urlsToTest = config.pagesToTest?.public || [];

  for (const urlToTest of urlsToTest) {
    let html;
    try {
      const response = await axios.get(urlToTest);
      html = response.data;
    } catch (err) {
      results.push({
        website: urlToTest,
        category: 'SEO & Accessibility',
        test_case: 'Page Availability',
        status: 'fail',
        description: `Could not fetch URL. Error: ${err.message}`
      });
      continue; // move to the next page
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

    // --- Test 3: Language Attribute ---
    const lang = $('html').attr('lang');
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Language Attribute Check',
      status: lang ? 'pass' : 'fail',
      description: lang
        ? `Language specified: "${lang}"`
        : 'The <html> tag is missing the lang attribute.'
    });

    // --- Test 4: Broken Links ---
    const links = $('a');
    const linkPromises = [];
    if (links.length > 0) {
      links.each((index, element) => {
        const href = $(element).attr('href');
        if (href && (href.startsWith('http') || href.startsWith('https'))) {
          const linkCheckPromise = axios.get(href).catch(error => {
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
      await Promise.all(linkPromises);
      if (results.filter(r => r.website === urlToTest && r.test_case.includes('Link Check')).length === 0) {
        results.push({
          website: urlToTest,
          category: 'SEO & Accessibility',
          test_case: 'Broken Link Check',
          status: 'pass',
          description: 'All links on the page are valid.'
        });
      }
    } else {
      results.push({
        website: urlToTest,
        category: 'SEO & Accessibility',
        test_case: 'Broken Link Check',
        status: 'pass',
        description: 'No links found on the page to check.'
      });
    }

    // --- Test 5: Single H1 Tag ---
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

    // --- Test 6: Meta Description ---
    const description = $('meta[name="description"]').attr('content');
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Meta Description Check',
      status: description ? 'pass' : 'fail',
      description: description
        ? 'Page has a meta description.'
        : 'Page is missing a meta description.'
    });

    // --- Test 7: Input Labels ---
    const inputsWithoutLabels = [];
    $('input, textarea, select').each((i, el) => {
      const id = $(el).attr('id');
      if (!id || !$(`label[for="${id}"]`).length) {
        if (!$(el).attr('aria-label')) {
          inputsWithoutLabels.push(id || $(el).attr('name') || `Input #${i + 1}`);
        }
      }
    });
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Input Label Check',
      status: inputsWithoutLabels.length > 0 ? 'fail' : 'pass',
      description: inputsWithoutLabels.length > 0
        ? `Missing labels for inputs: ${inputsWithoutLabels.join(', ')}`
        : 'All inputs have an associated label.'
    });

    // --- Test 8: Favicon ---
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]');
    results.push({
      website: urlToTest,
      category: 'SEO & Accessibility',
      test_case: 'Favicon Check',
      status: favicon.length > 0 ? 'pass' : 'fail',
      description: favicon.length > 0
        ? 'Favicon link is present.'
        : 'Page is missing a favicon link.'
    });
  }

  return results;
};
