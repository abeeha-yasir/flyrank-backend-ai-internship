#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://books.toscrape.com";
const CATALOGUE_PAGE_1 = `${BASE_URL}/catalogue/page-1.html`;
const CACHE_DIR = path.join(__dirname, "..", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "catalogue-page-1.html");

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
    console.log(`CACHE HIT - ${path.basename(cacheFile)} (${html.length} bytes)`);
    return html;
  }

  // Fetch from web
  console.log(`FETCH - ${url}`);
  const html = await fetchPage(url);
  fs.writeFileSync(cacheFile, html, "utf-8");
  console.log(`Cached to ${path.basename(cacheFile)} (${html.length} bytes)`);
  return html;
}

/**
 * Stage 1: Fetch once, cache once
 */
async function runStage1() {
  console.log("=" .repeat(60));
  console.log("Stage 1: Fetch once, cache once");
  console.log("=" .repeat(60));
  console.log();

  try {
    const html = await getCachedPage(CATALOGUE_PAGE_1, CACHE_FILE);
    console.log("\n✓ Stage 1 Complete: First catalogue page ready");
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }

  console.log("=" .repeat(60));
  console.log("Ready to proceed to Stage 2: Find all three pages");
  console.log("=" .repeat(60));
}

// Run the scraper
runStage1();
