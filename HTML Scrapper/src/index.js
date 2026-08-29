#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const BASE_URL = "https://books.toscrape.com";
const CATALOGUE_PAGE_1 = `${BASE_URL}/catalogue/page-1.html`;
const CACHE_DIR = path.join(__dirname, "..", "cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Fetch a page from the web with politeness headers
 */
async function fetchPage(url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FlyRankInternshipA9/1.0 (+https://github.com/abeeha-yasir/flyrank-backend-ai-internship)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

/**
 * Get page from cache or fetch and cache it
 */
async function getCachedPage(url, cacheFile) {
  // Check if cache exists
  if (fs.existsSync(cacheFile)) {
    const html = fs.readFileSync(cacheFile, "utf-8");
    console.log(`  CACHE HIT - ${path.basename(cacheFile)} (${html.length} bytes)`);
    return html;
  }

  // Fetch from web
  console.log(`  FETCH - ${url}`);
  const html = await fetchPage(url);
  fs.writeFileSync(cacheFile, html, "utf-8");
  console.log(`  Cached to ${path.basename(cacheFile)} (${html.length} bytes)`);
  return html;
}

/**
 * Extract book URLs from a catalogue page
 */
function extractBookLinks(html, pageUrl) {
  const $ = cheerio.load(html);
  const links = [];

  $("section.products article.product_pod h3 a").each((i, el) => {
    const href = $(el).attr("href");
    if (href) {
      // Convert relative URL to absolute URL
      const absoluteUrl = new URL(href, pageUrl).href;
      links.push(absoluteUrl);
    }
  });

  return links;
}

/**
 * Get next page link
 */
function getNextPageLink(html, currentPageUrl) {
  const $ = cheerio.load(html);
  const nextLink = $("ul.pager li.next a").attr("href");

  if (!nextLink) {
    return null;
  }

  // Convert relative URL to absolute URL
  return new URL(nextLink, currentPageUrl).href;
}

/**
 * Stage 2: Find all three pages
 */
async function runStage2() {
  console.log("=" .repeat(60));
  console.log("Stage 2: Find all three pages");
  console.log("=" .repeat(60));
  console.log();

  const allBookUrls = [];
  const uniqueUrls = new Set();
  let currentPageUrl = CATALOGUE_PAGE_1;
  let pageCount = 0;
  const maxPages = 3;

  try {
    while (currentPageUrl && pageCount < maxPages) {
      pageCount++;
      const cacheFile = path.join(CACHE_DIR, `catalogue-page-${pageCount}.html`);

      console.log(`\nFetching catalogue page ${pageCount}: ${currentPageUrl}`);
      const html = await getCachedPage(currentPageUrl, cacheFile);

      // Extract book links from this page
      const bookLinks = extractBookLinks(html, currentPageUrl);
      console.log(`  Found ${bookLinks.length} books on page ${pageCount}`);

      // Add to all links
      bookLinks.forEach((url) => {
        allBookUrls.push(url);
        uniqueUrls.add(url);
      });

      // Get next page link
      const nextPageUrl = getNextPageLink(html, currentPageUrl);
      if (nextPageUrl && pageCount < maxPages) {
        currentPageUrl = nextPageUrl;
        // Wait 500ms between requests (polite scraping)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        break;
      }
    }

    console.log("\n" + "=" .repeat(60));
    console.log(`Catalogue pages discovered: ${pageCount}`);
    console.log(`Total book URLs found: ${allBookUrls.length}`);
    console.log(`Unique book URLs: ${uniqueUrls.size}`);
    console.log("=" .repeat(60));
    console.log("\nReady to proceed to Stage 3: Extract book details");
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the scraper
runStage2();
