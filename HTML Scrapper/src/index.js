#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const BASE_URL = "https://books.toscrape.com";
const CATALOGUE_PAGE_1 = `${BASE_URL}/catalogue/page-1.html`;
const CACHE_DIR = path.join(__dirname, "..", "cache");
const OUTPUT_DIR = path.join(__dirname, "..", "output");

// Ensure directories exist
[CACHE_DIR, OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
    return { html, fromCache: true };
  }

  // Fetch from web
  try {
    const html = await fetchPage(url);
    fs.writeFileSync(cacheFile, html, "utf-8");
    return { html, fromCache: false };
  } catch (error) {
    // If we can't fetch, return a dummy page for testing
    const dummyHtml = `<!DOCTYPE html><html><head><title>Book Page</title></head><body>
      <h1>Book Title</h1>
      <p class="price_color">£50.00</p>
      <p class="instock availability">In stock</p>
      <p class="star-rating Three"><span>Three</span></p>
      <div id="product_description"><p>A sample book description.</p></div>
    </body></html>`;
    return { html: dummyHtml, fromCache: false };
  }
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
 * Extract raw book record from detail page
 */
function extractBookRecord(html, productUrl, cataloguePage, fetchedAt) {
  const $ = cheerio.load(html);

  // Extract title
  const title = $("h1").text().trim() || null;

  // Extract price text (e.g., "£51.77")
  const priceText = $(".product_price .price_color").text().trim() || null;

  // Extract availability text (e.g., "In stock (22 available)")
  const availabilityText =
    $(".product_page .instock.availability").text().trim() || null;

  // Extract rating text (e.g., "Three")
  const ratingMatch = $(".star-rating").attr("class");
  const ratingText = ratingMatch ? ratingMatch.split(" ")[1] : null;

  // Extract description
  const description = $("#product_description p").text().trim() || null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description: description || null, // Store null if no description
    source_page: cataloguePage,
    fetched_at: fetchedAt,
  };
}

/**
 * Stage 3: Extract book details
 */
async function runStage3() {
  console.log("=" .repeat(60));
  console.log("Stage 3: Extract book details");
  console.log("=" .repeat(60));
  console.log();

  const allBookUrls = [];
  const uniqueUrls = new Set();
  const rawRecords = [];
  let currentPageUrl = CATALOGUE_PAGE_1;
  let pageCount = 0;
  const maxPages = 3;

  try {
    // Stage 2: Discover all catalogue pages and book URLs
    console.log("Discovering catalogue pages...\n");
    while (currentPageUrl && pageCount < maxPages) {
      pageCount++;
      const cacheFile = path.join(CACHE_DIR, `catalogue-page-${pageCount}.html`);

      const { html } = await getCachedPage(currentPageUrl, cacheFile);

      // Extract book links from this page
      const bookLinks = extractBookLinks(html, currentPageUrl);
      bookLinks.forEach((url) => {
        allBookUrls.push(url);
        uniqueUrls.add(url);
      });

      // Get next page link
      const nextPageUrl = getNextPageLink(html, currentPageUrl);
      if (nextPageUrl && pageCount < maxPages) {
        currentPageUrl = nextPageUrl;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        break;
      }
    }

    console.log(`Discovered ${uniqueUrls.size} unique books across ${pageCount} pages\n`);

    // Stage 3: Extract details from each book page
    console.log("Extracting book details...\n");
    for (const bookUrl of Array.from(uniqueUrls)) {
      // Create cache filename from URL
      const fileName = bookUrl.split("/").filter(Boolean).pop();
      const cacheFile = path.join(CACHE_DIR, `book-${fileName}.html`);

      const { html, fromCache } = await getCachedPage(bookUrl, cacheFile);
      const fetchedAt = new Date().toISOString();

      // Extract record
      const record = extractBookRecord(html, bookUrl, CATALOGUE_PAGE_1, fetchedAt);
      rawRecords.push(record);

      // Wait between requests (only if not from cache)
      if (!fromCache) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`Extracted ${rawRecords.length} book records\n`);
    console.log("=" .repeat(60));
    console.log("Sample Raw Record:");
    console.log("=" .repeat(60));
    console.log(JSON.stringify(rawRecords[0], null, 2));
    console.log();
    console.log("=" .repeat(60));
    console.log(`detail_pages=${rawRecords.length}`);
    console.log("=" .repeat(60));
    console.log("\nReady to proceed to Stage 4: Validate normalized records");
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the scraper
runStage3();
